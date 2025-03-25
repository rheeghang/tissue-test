import React, { useEffect, useRef } from 'react'

const AudioController = ({ 
  isPlaying, 
  setIsPlaying, 
  showAudioButton, 
  setShowAudioButton, 
  setDebugInfo,
  originalText,
  maxAngleDiff,
  tolerance,
  maxDistance,
  title = "보이지 않는 조각들: 공기조각",
  artist = "송예슬"
}) => {
  // 오디오 레퍼런스
  const noiseSoundRef = useRef(null)
  const ttsRef = useRef(null)
  const currentWordIndexRef = useRef(0)
  const wordsArrayRef = useRef(`${title}. 작가 ${artist}. ${originalText}`.split(' '))

  // TTS 볼륨 페이드 효과
  const smoothTTSFade = (utterance, startVol, targetVol, duration = 500) => {
    if (!utterance) return;
    
    const startTime = performance.now();
    const volDiff = targetVol - startVol;

    const fade = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 이징 함수 적용
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      utterance.volume = startVol + (volDiff * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(fade);
      }
    };

    requestAnimationFrame(fade);
  };

  // 노이즈 볼륨 페이드 효과
  const smoothVolumeFade = (currentVol, targetVol, duration = 500) => {
    if (!noiseSoundRef.current) return;
    
    const startTime = performance.now();
    const volDiff = targetVol - currentVol;

    const fade = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 이징 함수 적용
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const newVolume = currentVol + (volDiff * easeProgress);
      noiseSoundRef.current.volume = newVolume;

      if (progress < 1) {
        requestAnimationFrame(fade);
      }
    };

    requestAnimationFrame(fade);
  };

  // TTS 이벤트 핸들러 설정
  const setupTTSEventHandlers = (utterance) => {
    if (!utterance) return;
    
    let wordCount = 0;
    
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        wordCount++;
        currentWordIndexRef.current = Math.min(
          wordCount,
          wordsArrayRef.current.length - 1
        );
        
        console.log('현재 단어:', wordsArrayRef.current[currentWordIndexRef.current]);
      }
    };

    utterance.onend = () => {
      console.log('TTS 재생 완료');
      currentWordIndexRef.current = 0;
      wordCount = 0;
    };

    utterance.onerror = (event) => {
      console.error('TTS 에러:', event);
      setDebugInfo('TTS 에러: ' + event.error);
    };

    utterance.onstart = () => {
      console.log('TTS 재생 시작');
      setDebugInfo('TTS 재생 중');
    };
  };

  // TTS 재생 함수
  const playTTS = (startWordIndex = 0) => {
    if (!isPlaying) return;
    
    const words = wordsArrayRef.current;
    const startIndex = Math.max(0, Math.min(startWordIndex, words.length - 1));
    
    try {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(words.slice(startIndex).join(' '));
      Object.assign(utterance, {
        lang: 'ko-KR',
        rate: 1.0,
        pitch: 1.0,
        volume: 1  // 초기 볼륨을 1로 설정
      });

      setupTTSEventHandlers(utterance);
      
      ttsRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      
      console.log('TTS 재생:', {
        시작단어: words[startIndex],
        남은단어수: words.length - startIndex
      });
    } catch (error) {
      console.error('TTS 재생 실패:', error);
    }
  };

  // 오디오 초기화
  useEffect(() => {
    // TTS 초기화
    if (!ttsRef.current) {
      const utterance = new SpeechSynthesisUtterance(wordsArrayRef.current.join(' '));
      Object.assign(utterance, {
        lang: 'ko-KR',
        rate: 1.0,
        pitch: 1.0,
        volume: 0  // 초기에는 볼륨 0으로 시작
      });
      setupTTSEventHandlers(utterance);
      ttsRef.current = utterance;
    }

    // 노이즈 사운드 초기화
    noiseSoundRef.current = new Audio(process.env.PUBLIC_URL + '/sound1.mp3');
    const noiseSound = noiseSoundRef.current;
    noiseSound.loop = true;
    noiseSound.volume = 0;
    noiseSound.preload = 'auto';

    const setupAudio = async () => {
      try {
        await noiseSound.load();
        await noiseSound.play();
        setIsPlaying(true);
        setShowAudioButton(false);
        
        // 초기 상태 설정
        const isInTargetAngle = maxAngleDiff <= tolerance;
        if (isInTargetAngle) {
          noiseSound.volume = 0;
          if (ttsRef.current) {
            ttsRef.current.volume = 1;
            window.speechSynthesis.speak(ttsRef.current);
          }
        } else {
          noiseSound.volume = Math.min(1, maxAngleDiff / maxDistance);
          if (ttsRef.current) {
            ttsRef.current.volume = 0;
          }
        }
      } catch (error) {
        console.error('오디오 초기화 실패:', error);
        setIsPlaying(false);
        setShowAudioButton(true);
      }
    };

    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', setupAudio, { once: true });
    } else {
      setupAudio();
    }

    return () => {
      noiseSound.pause();
      document.removeEventListener('touchstart', setupAudio);
    };
  }, [setIsPlaying, setShowAudioButton, maxAngleDiff, tolerance, maxDistance]);

  // 각도에 따른 오디오 제어
  useEffect(() => {
    if (!isPlaying) return;

    const isInTargetAngle = maxAngleDiff <= tolerance;
    const targetNoiseVolume = isInTargetAngle ? 0 : Math.min(1, maxAngleDiff / maxDistance);

    // 노이즈 사운드와 TTS 동시 제어
    if (noiseSoundRef.current) {
      const currentNoiseVolume = noiseSoundRef.current.volume;
      
      if (isInTargetAngle) {
        // 목표 각도 진입: 노이즈 페이드 아웃 & TTS 페이드 인
        if (currentNoiseVolume > 0) {
          smoothVolumeFade(currentNoiseVolume, 0);
        }
        
        // TTS 페이드 인
        if (ttsRef.current && ttsRef.current.volume < 1) {
          smoothTTSFade(ttsRef.current, ttsRef.current.volume, 1);
          if (!window.speechSynthesis.speaking) {
            window.speechSynthesis.speak(ttsRef.current);
          }
        }

        // 노이즈가 완전히 페이드 아웃되면 일시정지
        if (currentNoiseVolume === 0) {
          noiseSoundRef.current.pause();
        }
      } else {
        // 목표 각도 이탈: 노이즈 페이드 인 & TTS 페이드 아웃
        if (noiseSoundRef.current.paused) {
          noiseSoundRef.current.play().catch(console.error);
        }
        smoothVolumeFade(currentNoiseVolume, targetNoiseVolume);

        // TTS 페이드 아웃
        if (ttsRef.current && ttsRef.current.volume > 0) {
          smoothTTSFade(ttsRef.current, ttsRef.current.volume, 0);
        }
      }
    }

    // 디버그 정보 업데이트
    const noiseVolume = noiseSoundRef.current?.volume.toFixed(2) || '0.00';
    const ttsStatus = window.speechSynthesis.speaking ? '재생중' : '정지';
    const ttsVolume = ttsRef.current?.volume.toFixed(2) || '0.00';
    setDebugInfo(`각도차: ${maxAngleDiff.toFixed(1)}° | 노이즈: ${noiseVolume} | TTS: ${ttsStatus} (볼륨: ${ttsVolume})`);
  }, [isPlaying, maxAngleDiff, tolerance, maxDistance]);

  const initTTS = () => {
    if (!window.speechSynthesis) {
      console.error('TTS를 지원하지 않는 브라우저입니다.');
      return;
    }
    // ... TTS 초기화 코드 ...
  };

  // 오디오 시작 버튼 렌더링
  return (
    <>
      {showAudioButton && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => {
              if (noiseSoundRef.current) {
                noiseSoundRef.current.play();
                setIsPlaying(true);
                setShowAudioButton(false);
              }
            }}
            className="bg-white/80 px-4 py-2 rounded-full shadow-lg border border-gray-200 text-black text-sm hover:bg-white"
          >
            소리 시작하기
          </button>
        </div>
      )}
    </>
  );
};

export default AudioController;