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

  // 각도에 따른 오디오 제어
  useEffect(() => {
    const isInTargetAngle = maxAngleDiff <= tolerance;
    
    // 상태 변화 감지를 위한 setTimeout
    setTimeout(() => {
      if (noiseSoundRef.current && ttsRef.current) {
        // 노이즈 볼륨 즉시 변경
        const newVolume = isInTargetAngle ? 0 : 1;
        noiseSoundRef.current.volume = newVolume;
        
        // TTS 제어
        if (isInTargetAngle) {
          if (!window.speechSynthesis.speaking) {
            window.speechSynthesis.speak(ttsRef.current);
          } else if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } else {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
          }
        }

        // 디버그 정보 업데이트
        const noiseVolume = noiseSoundRef.current.volume;
        const ttsStatus = window.speechSynthesis.paused ? '일시정지' : 
                         window.speechSynthesis.speaking ? '재생중' : '정지';
        const currentWord = wordsArrayRef.current[currentWordIndexRef.current];
        
        // 상태 정보를 더 자세히 표시
        setDebugInfo(`
          각도차: ${maxAngleDiff.toFixed(1)}° | 
          허용범위: ${tolerance}° | 
          노이즈: ${noiseVolume} | 
          TTS: ${ttsStatus} | 
          현재 단어: ${currentWord} |
          목표각도: ${isInTargetAngle ? '진입' : '이탈'} |
          재생상태: ${isPlaying ? '재생중' : '정지'}
        `);
      }
    }, 50); // 50ms 지연으로 상태 업데이트 완료 대기
  }, [maxAngleDiff, tolerance, isPlaying]);

  // 오디오 초기화
  useEffect(() => {
    const initAudio = () => {
      try {
        // TTS 지원 여부 확인
        if (!window.speechSynthesis) {
          console.error('TTS를 지원하지 않는 브라우저입니다.');
          return null;
        }

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
        
        // 오디오 재생 시도
        try {
          await noiseSound.play();
          console.log('노이즈 사운드 재생 시작');
        } catch (playError) {
          console.error('노이즈 사운드 재생 실패:', playError);
          throw playError;
        }
        
        // 상태 업데이트
        setIsPlaying(true);
        setShowAudioButton(false);
        
        // 초기 상태 설정
        const isInTargetAngle = maxAngleDiff <= tolerance;
        noiseSound.volume = isInTargetAngle ? 0 : 1;
        
        if (isInTargetAngle && ttsRef.current) {
          window.speechSynthesis.speak(ttsRef.current);
        }

        console.log('오디오 초기화 완료:', {
          isInTargetAngle,
          noiseVolume: noiseSound.volume,
          ttsReady: !!ttsRef.current,
          isPlaying: true
        });
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

  return (
    <>
      {showAudioButton && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={async () => {
              try {
                if (noiseSoundRef.current) {
                  await noiseSoundRef.current.play();
                  // 초기 상태 설정
                  const isInTargetAngle = maxAngleDiff <= tolerance;
                  noiseSoundRef.current.volume = isInTargetAngle ? 0 : 1;
                  
                  setTimeout(() => {
                    setIsPlaying(true);
                    setShowAudioButton(false);
                    
                    if (isInTargetAngle && ttsRef.current) {
                      window.speechSynthesis.speak(ttsRef.current);
                    }
                  }, 100);
                }
              } catch (error) {
                console.error('오디오 재생 실패:', error);
                setDebugInfo(`오디오 재생 실패: ${error.message}`);
              }
            }}
            className="bg-white/80 px-4 py-2 rounded-full shadow-lg border border-gray-200 text-black text-sm hover:bg-white"
          >
            소리 시작하기
          </button>
        </div>
      )}
      
      {/* 디버그 정보 표시 */}
      <div className="fixed bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
        <div className="font-bold mb-2">디버그 정보:</div>
        <div>각도차: {maxAngleDiff.toFixed(1)}°</div>
        <div>허용범위: {tolerance}°</div>
        <div>노이즈 볼륨: {noiseSoundRef.current?.volume || 0}</div>
        <div>TTS 상태: {
          window.speechSynthesis.paused ? '일시정지' : 
          window.speechSynthesis.speaking ? '재생중' : '정지'
        }</div>
        <div>현재 단어: {wordsArrayRef.current[currentWordIndexRef.current]}</div>
        <div>TTS 준비: {ttsRef.current ? '예' : '아니오'}</div>
        <div>재생 중: {isPlaying ? '예' : '아니오'}</div>
        <div>목표각도: {maxAngleDiff <= tolerance ? '진입' : '이탈'}</div>
      </div>
    </>
  );
};

export default AudioController;