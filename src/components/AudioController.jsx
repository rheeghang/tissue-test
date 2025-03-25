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
  const smoothTTSFade = (utterance, startVol, targetVol, duration = 500, onComplete = null) => {
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
      } else if (onComplete) {
        onComplete();
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
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const wordIndex = Math.min(event.charIndex, words.length - 1);
          currentWordIndexRef.current = wordIndex;
          console.log('현재 단어:', words[wordIndex]);
        }
      };

      utterance.onend = () => {
        console.log('TTS 재생 완료');
        currentWordIndexRef.current = startIndex;
      };

      utterance.onerror = (event) => {
        console.error('TTS 에러:', event);
        setDebugInfo('TTS 에러: ' + event.error);
      };

      ttsRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      
      console.log('TTS 재생 시작:', {
        시작단어: words[startIndex],
        현재인덱스: startIndex
      });
    } catch (error) {
      console.error('TTS 재생 실패:', error);
      setDebugInfo('TTS 재생 실패: ' + error.message);
    }
  };

  // 오디오 초기화
  useEffect(() => {
    // 노이즈 사운드 초기화
    const initNoiseSound = () => {
      try {
        noiseSoundRef.current = new Audio(process.env.PUBLIC_URL + '/sound1.mp3');
        const noiseSound = noiseSoundRef.current;
        noiseSound.loop = true;
        noiseSound.volume = 1;
        noiseSound.preload = 'auto';
        return noiseSound;
      } catch (error) {
        console.error('노이즈 사운드 생성 실패:', error);
        return null;
      }
    };

    const setupAudio = async () => {
      try {
        const noiseSound = initNoiseSound();
        if (!noiseSound) throw new Error('노이즈 사운드 초기화 실패');

        await noiseSound.play();
        setIsPlaying(true);
        setShowAudioButton(false);
        
        // 초기 상태 설정
        const isInTargetAngle = maxAngleDiff <= tolerance;
        if (isInTargetAngle) {
          noiseSound.volume = 0;
          playTTS(0);
        } else {
          noiseSound.volume = 1;
        }
      } catch (error) {
        console.error('오디오 초기화 실패:', error);
        setIsPlaying(false);
        setShowAudioButton(true);
      }
    };

    const handleUserInteraction = () => {
      setupAudio();
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };

    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleUserInteraction);
      document.addEventListener('click', handleUserInteraction);
    } else {
      handleUserInteraction();
    }

    return () => {
      if (noiseSoundRef.current) {
        noiseSoundRef.current.pause();
      }
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [setIsPlaying, setShowAudioButton, maxAngleDiff, tolerance]);

  // 각도에 따른 오디오 제어
  useEffect(() => {
    if (!isPlaying) return;

    const isInTargetAngle = maxAngleDiff <= tolerance;
    
    // 상태 로깅
    console.log('오디오 상태:', {
      isInTargetAngle,
      maxAngleDiff,
      tolerance,
      isSpeaking: window.speechSynthesis.speaking,
      isPaused: window.speechSynthesis.paused,
      currentWordIndex: currentWordIndexRef.current
    });

    // 노이즈 사운드와 TTS 동시 제어
    if (noiseSoundRef.current) {
      if (isInTargetAngle) {
        // 목표 각도 진입
        console.log('목표 각도 진입');
        noiseSoundRef.current.volume = 0;
        
        // TTS 처리
        if (!window.speechSynthesis.speaking) {
          console.log('TTS 새로 시작 (현재 단어부터):', currentWordIndexRef.current);
          playTTS(currentWordIndexRef.current);
        } else if (window.speechSynthesis.paused) {
          console.log('TTS 재개');
          window.speechSynthesis.resume();
        }
      } else {
        // 목표 각도 이탈
        console.log('목표 각도 이탈');
        noiseSoundRef.current.volume = 1;
        
        // TTS 일시정지
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
        }
      }
    }

    // 디버그 정보 업데이트
    const noiseVolume = noiseSoundRef.current?.volume || 0;
    const ttsStatus = window.speechSynthesis.paused ? '일시정지' : 
                     window.speechSynthesis.speaking ? '재생중' : '정지';
    const currentWord = wordsArrayRef.current[currentWordIndexRef.current];
    setDebugInfo(`각도차: ${maxAngleDiff.toFixed(1)}° | 노이즈: ${noiseVolume} | TTS: ${ttsStatus} | 현재 단어: ${currentWord}`);
  }, [isPlaying, maxAngleDiff, tolerance]);

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
            onClick={async () => {
              try {
                if (noiseSoundRef.current) {
                  await noiseSoundRef.current.play();
                  setIsPlaying(true);
                  setShowAudioButton(false);
                }
              } catch (error) {
                console.error('오디오 재생 실패:', error);
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