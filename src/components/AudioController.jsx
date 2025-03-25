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
        volume: 0
      });

      setupTTSEventHandlers(utterance);
      smoothTTSFade(utterance, 0, 1, 500);
      
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
  }, [setIsPlaying, setShowAudioButton]);

  // 각도에 따른 오디오 제어
  useEffect(() => {
    if (!isPlaying) return;

    const isInTargetAngle = maxAngleDiff <= tolerance;
    const targetNoiseVolume = isInTargetAngle ? 0 : Math.min(1, maxAngleDiff / maxDistance);

    // 노이즈 사운드와 TTS 동시 제어
    if (noiseSoundRef.current) {
      const currentNoiseVolume = noiseSoundRef.current.volume;
      
      if (isInTargetAngle) {
        // 목표 각도 진입: 노이즈 페이드 아웃 & TTS 시작
        smoothVolumeFade(currentNoiseVolume, 0);
        
        if (!window.speechSynthesis.speaking) {
          playTTS(currentWordIndexRef.current);
        }

        if (currentNoiseVolume === 0) {
          noiseSoundRef.current.pause();
        }
      } else {
        // 목표 각도 이탈: 노이즈 페이드 인 & TTS 중지
        if (noiseSoundRef.current.paused) {
          noiseSoundRef.current.play().catch(console.error);
        }
        smoothVolumeFade(currentNoiseVolume, targetNoiseVolume);

        if (window.speechSynthesis.speaking) {
          if (ttsRef.current) {
            smoothTTSFade(ttsRef.current, ttsRef.current.volume, 0);
            setTimeout(() => window.speechSynthesis.cancel(), 500);
          }
        }
      }
    }

    setDebugInfo(`각도차: ${maxAngleDiff.toFixed(1)}°, 노이즈: ${noiseSoundRef.current?.volume.toFixed(1)}, 단어: ${wordsArrayRef.current[currentWordIndexRef.current]}`);
  }, [isPlaying, maxAngleDiff, tolerance, maxDistance]);

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