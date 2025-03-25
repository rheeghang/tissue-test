import React, { useEffect, useRef, useState } from 'react'

const AudioController = ({ 
  isPlaying, 
  setIsPlaying, 
  showAudioButton, 
  setShowAudioButton, 
  setDebugInfo,
  originalText,
  maxAngleDiff,
  tolerance,
  maxDistance
}) => {
  // 오디오 레퍼런스들
  const noiseSoundRef = useRef(null)
  const ttsRef = useRef(null)
  const lastTTSVolumeRef = useRef(0) // TTS 볼륨 상태 추적용

  // 디버그 함수
  const logAudioStatus = () => {
    if (window.speechSynthesis) {
      console.log('🗣️ TTS 상태:', {
        speaking: window.speechSynthesis.speaking,
        pending: window.speechSynthesis.pending,
        paused: window.speechSynthesis.paused
      })
    }

    const noiseSound = noiseSoundRef.current
    if (noiseSound) {
      console.log('🔊 노이즈 상태:', {
        readyState: noiseSound.readyState,
        paused: noiseSound.paused,
        volume: noiseSound.volume,
        error: noiseSound.error
      })
    }
  }

  // TTS 초기화 함수
  const initTTS = () => {
    if (!('speechSynthesis' in window)) {
      console.error('TTS를 지원하지 않는 브라우저입니다.')
      return null
    }

    const utterance = new SpeechSynthesisUtterance(originalText)
    utterance.lang = 'ko-KR'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onend = () => {
      console.log('TTS 재생 완료')
      logAudioStatus()
    }

    utterance.onerror = (event) => {
      console.error('TTS 에러:', event)
      setDebugInfo('TTS 에러 발생: ' + event.error)
      logAudioStatus()
    }

    utterance.onstart = () => {
      console.log('TTS 재생 시작')
      setDebugInfo('TTS 재생 중')
      logAudioStatus()
    }

    return utterance
  }

  // 오디오 초기화
  useEffect(() => {
    noiseSoundRef.current = new Audio()
    noiseSoundRef.current.src = process.env.PUBLIC_URL + '/sound1.mp3'
    
    const noiseSound = noiseSoundRef.current
    noiseSound.loop = true
    noiseSound.volume = 0
    noiseSound.preload = 'auto'

    // iOS에서 오디오 재생을 위한 설정
    const setupAudio = async () => {
      console.log('오디오 초기화 시작')
      try {
        await noiseSound.load()
        await noiseSound.play()  // 여기서 노이즈 사운드를 재생했다가
        noiseSound.pause()       // 바로 멈추고 있음
        noiseSound.currentTime = 0
        
        // TTS 초기화
        ttsRef.current = initTTS()
        
        console.log('오디오 초기화 성공')
        setDebugInfo('오디오 초기화 완료')
        setIsPlaying(true)
        setShowAudioButton(false)
      } catch (error) {
        console.error('오디오 초기화 실패:', error)
        setDebugInfo('오디오 초기화 실패: ' + error.message)
        setIsPlaying(false)
        setShowAudioButton(true)
      }
    }

    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', setupAudio, { once: true })
    } else {
      setupAudio()
    }

    return () => {
      if (noiseSound) {
        noiseSound.pause()
        noiseSound.currentTime = 0
      }
      document.removeEventListener('touchstart', setupAudio)
    }
  }, [setDebugInfo])

  // TTS 실행 함수를 분리
  const playTTS = (startWordIndex = 0) => {
    if (!ttsRef.current || !isPlaying) return;
    
    console.log('🗣️ TTS 재생 시도:', {
      현재상태: window.speechSynthesis.speaking ? '재생중' : '중지됨',
      시작단어위치: startWordIndex
    });

    try {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        if (ttsRef.current && ttsRef.current.volume > 0) {
          // 단어 단위로 텍스트 분할
          const words = originalText.split(' ');
          ttsRef.current.text = words.slice(startWordIndex).join(' ');
          
          console.log('TTS 재생 시작:', {
            시작단어: words[startWordIndex],
            전체단어수: words.length,
            남은단어수: words.length - startWordIndex
          });
          
          window.speechSynthesis.speak(ttsRef.current);
        }
      }, 100);
    } catch (error) {
      console.error('TTS 재생 실패:', error);
    }
  };

  // 현재 재생 중인 단어 위치를 추적하기 위한 변수
  const currentWordIndexRef = useRef(0);
  
  // TTS 이벤트 핸들러 설정 함수
  const setupTTSEventHandlers = (utterance) => {
    if (!utterance) return;
    
    // 단어 경계 이벤트
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        currentWordIndexRef.current = event.charIndex;
        console.log('현재 단어 위치:', event.charIndex);
      }
    };

    utterance.onend = () => {
      console.log('TTS 재생 완료');
      currentWordIndexRef.current = 0;
    };

    utterance.onerror = (event) => {
      console.error('TTS 에러:', event);
      setDebugInfo('TTS 에러 발생: ' + event.error);
    };

    utterance.onstart = () => {
      console.log('TTS 재생 시작');
      setDebugInfo('TTS 재생 중');
    };
  };

  // 페이드 효과를 위한 상태 변수
  const fadeStateRef = useRef({
    currentNoiseVolume: 0,
    targetNoiseVolume: 0,
    isFading: false
  });

  // 부드러운 볼륨 전환을 위한 함수
  const smoothVolumeFade = (currentVol, targetVol, duration = 1000) => {
    if (fadeStateRef.current.isFading) return;
    fadeStateRef.current.isFading = true;

    const startTime = performance.now();
    const startVol = currentVol;
    const volDiff = targetVol - startVol;

    const fade = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 이징 함수 적용 (cubic-bezier)
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const newVolume = startVol + (volDiff * easeProgress);
      
      if (noiseSoundRef.current) {
        noiseSoundRef.current.volume = newVolume;
        fadeStateRef.current.currentNoiseVolume = newVolume;
      }

      if (progress < 1) {
        requestAnimationFrame(fade);
      } else {
        fadeStateRef.current.isFading = false;
      }
    };

    requestAnimationFrame(fade);
  };

  // 볼륨 업데이트
  useEffect(() => {
    if (!isPlaying) return;

    const isInTargetAngle = maxAngleDiff <= tolerance;
    const targetNoiseVolume = isInTargetAngle ? 0 : Math.min(1, maxAngleDiff / maxDistance);
    const ttsVolume = isInTargetAngle ? 1 : 0;

    console.log('📊 상태 업데이트:', {
      각도차이: maxAngleDiff.toFixed(2),
      목표도달: isInTargetAngle ? 'Y' : 'N',
      목표노이즈볼륨: targetNoiseVolume.toFixed(2),
      TTS볼륨: ttsVolume,
      현재단어위치: currentWordIndexRef.current
    });

    // 노이즈 사운드 페이드 효과 적용
    if (noiseSoundRef.current) {
      const currentNoiseVolume = noiseSoundRef.current.volume;
      if (Math.abs(currentNoiseVolume - targetNoiseVolume) > 0.01) {
        smoothVolumeFade(currentNoiseVolume, targetNoiseVolume);
      }

      // 노이즈 재생 상태 관리
      if (targetNoiseVolume > 0 && noiseSoundRef.current.paused) {
        noiseSoundRef.current.play().catch(console.error);
      }
    }

    // TTS 제어
    if (ttsRef.current) {
      const prevVolume = ttsRef.current.volume;
      ttsRef.current.volume = ttsVolume;

      // TTS 상태 추적
      const ttsSpeaking = window.speechSynthesis.speaking;

      // 목표 각도 진입 시 TTS 재생
      if (isInTargetAngle && !ttsSpeaking && prevVolume === 0 && ttsVolume === 1) {
        console.log('🎯 목표 각도 진입 - TTS 재생');
        const lastWordIndex = Math.floor(currentWordIndexRef.current / 2); // 약간 이전 위치부터 시작
        playTTS(lastWordIndex);
      }
      // 목표 각도 이탈 시 TTS 일시 중지
      else if (!isInTargetAngle && ttsSpeaking) {
        console.log('🎯 목표 각도 이탈 - TTS 중지', {
          현재단어위치: currentWordIndexRef.current
        });
        window.speechSynthesis.cancel();
      }
    }

    setDebugInfo(`각도차: ${maxAngleDiff.toFixed(1)}°, 노이즈: ${noiseSoundRef.current?.volume.toFixed(1)}, TTS: ${ttsVolume}, 단어위치: ${currentWordIndexRef.current}`);
  }, [isPlaying, maxAngleDiff, tolerance, maxDistance, originalText]);

  // TTS 초기화
  useEffect(() => {
    if (ttsRef.current) {
      setupTTSEventHandlers(ttsRef.current);
    }
  }, [ttsRef.current]);

  // 사용자 인터랙션을 통한 TTS 실행 (첫 실행용)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (ttsRef.current && !window.speechSynthesis.speaking && isPlaying) {
        console.log('🎯 TTS 재생 조건 충족 (첫 실행)');
        playTTS();
      }
    };

    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('click', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [isPlaying]);

  // 상태 모니터링
  useEffect(() => {
    const status = {
      '🎵 재생상태': isPlaying ? '재생중' : '중지됨',
      '🔊 노이즈볼륨': noiseSoundRef.current?.volume?.toFixed(2) ?? 'N/A',
      '🗣 TTS볼륨': ttsRef.current?.volume?.toFixed(2) ?? 'N/A',
      '📐 각도차이': maxAngleDiff.toFixed(2),
      '🎯 허용오차': tolerance,
      '📏 최대거리': maxDistance
    }
    
    console.log('\n=== 현재 상태 ===')
    Object.entries(status).forEach(([key, value]) => {
      console.log(`${key}: ${value}`)
    })
    console.log('================\n')
  }, [isPlaying, maxAngleDiff, tolerance, maxDistance])

  // 오디오 재생 핸들러
  const handleAudioStart = async () => {
    try {
      console.log('🎵 오디오 재생 시도 - 초기 상태:', {
        isPlaying,
        hasNoiseRef: !!noiseSoundRef.current,
        hasTTSRef: !!ttsRef.current,
        noiseReadyState: noiseSoundRef.current?.readyState,
        noisePaused: noiseSoundRef.current?.paused,
        noiseVolume: noiseSoundRef.current?.volume,
        ttsSpeaking: window.speechSynthesis?.speaking
      })
      setDebugInfo('오디오 재생 시도 중...')
      
      const noiseSound = noiseSoundRef.current
      if (!noiseSound) {
        throw new Error('오디오 객체가 초기화되지 않음')
      }

      // 오디오 상태 로깅
      console.log('오디오 상태:', {
        src: noiseSound.src,
        readyState: noiseSound.readyState,
        paused: noiseSound.paused,
        volume: noiseSound.volume,
        error: noiseSound.error
      })

      // 오디오가 로드될 때까지 대기
      if (noiseSound.readyState < 4) { // HAVE_ENOUGH_DATA
        await new Promise((resolve, reject) => {
          noiseSound.oncanplaythrough = resolve
          noiseSound.onerror = reject
          noiseSound.load()
        })
      }

      // 오디오 재생 시도
      await noiseSound.play()
      
      // TTS 초기화 및 재생
      if ('speechSynthesis' in window) {
        console.log('TTS 초기화 시작')
        window.speechSynthesis.cancel() // 기존 TTS 중지
        
        ttsRef.current = new SpeechSynthesisUtterance(originalText)
        ttsRef.current.lang = 'ko-KR'
        ttsRef.current.rate = 1.0
        ttsRef.current.pitch = 1.0
        ttsRef.current.volume = 1.0  // 초기 볼륨을 1로 설정

        // TTS 이벤트 핸들러들
        ttsRef.current.onend = () => {
          console.log('TTS 재생 완료')
          if (ttsRef.current && ttsRef.current.volume > 0.1) {
            console.log('TTS 재시작')
            window.speechSynthesis.speak(ttsRef.current)
          }
        }

        ttsRef.current.onerror = (event) => {
          console.error('TTS 에러:', event)
          setDebugInfo('TTS 에러 발생: ' + event.error)
        }

        ttsRef.current.onstart = () => {
          console.log('TTS 재생 시작')
          setDebugInfo('TTS 재생 중')
        }

        // 초기 TTS 재생
        setTimeout(() => {
          try {
            console.log('TTS 재생 시도')
            window.speechSynthesis.speak(ttsRef.current)
          } catch (error) {
            console.error('TTS 재생 실패:', error)
            setDebugInfo('TTS 재생 실패: ' + error.message)
          }
        }, 1000)
      } else {
        console.error('TTS를 지원하지 않는 브라우저입니다.')
        setDebugInfo('TTS를 지원하지 않는 브라우저입니다.')
      }

      console.log('오디오 재생 성공')
      setDebugInfo('오디오 재생 중')
      setIsPlaying(true)
      setShowAudioButton(false)
    } catch (error) {
      console.error('오디오 재생 실패:', error)
      setDebugInfo('오디오 재생 실패: ' + error.message)
      setShowAudioButton(true)
    }
  }

  return (
    <>
      {/* 오디오 시작 버튼 */}
      {showAudioButton && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleAudioStart}
            className="bg-white/80 px-4 py-2 rounded-full shadow-lg border border-gray-200 text-black text-sm hover:bg-white"
          >
            소리 시작하기
          </button>
        </div>
      )}
    </>
  )
}

export default AudioController 