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

  // 오디오 초기화
  useEffect(() => {
    const initAudio = () => {
      try {
        // 노이즈 사운드 초기화
        noiseSoundRef.current = new Audio(process.env.PUBLIC_URL + '/sound1.mp3');
        const noiseSound = noiseSoundRef.current;
        noiseSound.loop = true;
        noiseSound.volume = 1;
        noiseSound.preload = 'auto';

        // TTS 초기화
        const utterance = new SpeechSynthesisUtterance(wordsArrayRef.current.join(' '));
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1;

        setupTTSEventHandlers(utterance);
        ttsRef.current = utterance;

        return { noiseSound, utterance };
      } catch (error) {
        console.error('오디오 초기화 실패:', error);
        return null;
      }
    };

    const setupAudio = async () => {
      try {
        const audio = initAudio();
        if (!audio) throw new Error('오디오 초기화 실패');

        const { noiseSound } = audio;
        await noiseSound.play();
        
        // 상태 업데이트를 setTimeout으로 지연
        setTimeout(() => {
          setIsPlaying(true);
          setShowAudioButton(false);
          
          // 초기 상태 설정
          const isInTargetAngle = maxAngleDiff <= tolerance;
          if (isInTargetAngle) {
            noiseSound.volume = 0;
            window.speechSynthesis.speak(ttsRef.current);
          } else {
            noiseSound.volume = 1;
          }

          console.log('오디오 초기화 완료:', {
            isInTargetAngle,
            noiseVolume: noiseSound.volume,
            ttsReady: !!ttsRef.current
          });
        }, 100);
      } catch (error) {
        console.error('오디오 설정 실패:', error);
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
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [setIsPlaying, setShowAudioButton, maxAngleDiff, tolerance]);

  // 각도에 따른 오디오 제어
  useEffect(() => {
    if (!isPlaying) return;

    const isInTargetAngle = maxAngleDiff <= tolerance;
    
    // 상태 변화 감지를 위한 setTimeout
    setTimeout(() => {
      console.log('각도 상태 변경:', {
        isInTargetAngle,
        maxAngleDiff,
        tolerance,
        isSpeaking: window.speechSynthesis.speaking,
        isPaused: window.speechSynthesis.paused
      });

      if (noiseSoundRef.current && ttsRef.current) {
        if (isInTargetAngle) {
          // 목표 각도 진입
          console.log('목표 각도 진입');
          noiseSoundRef.current.volume = 0;
          
          if (!window.speechSynthesis.speaking) {
            console.log('TTS 시작');
            window.speechSynthesis.speak(ttsRef.current);
          } else if (window.speechSynthesis.paused) {
            console.log('TTS 재개');
            window.speechSynthesis.resume();
          }
        } else {
          // 목표 각도 이탈
          console.log('목표 각도 이탈');
          noiseSoundRef.current.volume = 1;
          
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            console.log('TTS 일시정지');
            window.speechSynthesis.pause();
          }
        }

        // 디버그 정보 업데이트
        const noiseVolume = noiseSoundRef.current.volume;
        const ttsStatus = window.speechSynthesis.paused ? '일시정지' : 
                         window.speechSynthesis.speaking ? '재생중' : '정지';
        const currentWord = wordsArrayRef.current[currentWordIndexRef.current];
        setDebugInfo(`각도차: ${maxAngleDiff.toFixed(1)}° | 노이즈: ${noiseVolume} | TTS: ${ttsStatus} | 현재 단어: ${currentWord}`);
      }
    }, 100);
  }, [isPlaying, maxAngleDiff, tolerance]);

  return (
    <>
      {showAudioButton && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={async () => {
              try {
                if (noiseSoundRef.current) {
                  await noiseSoundRef.current.play();
                  // 상태 업데이트를 setTimeout으로 지연
                  setTimeout(() => {
                    setIsPlaying(true);
                    setShowAudioButton(false);
                  }, 100);
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