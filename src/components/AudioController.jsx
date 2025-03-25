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

  // 오디오 초기화
  useEffect(() => {
    // 오디오 객체 생성
    noiseSoundRef.current = new Audio()
    noiseSoundRef.current.src = process.env.PUBLIC_URL + '/sound1.mp3'
    
    const noiseSound = noiseSoundRef.current

    // 노이즈 사운드 설정
    noiseSound.loop = true
    noiseSound.volume = 0
    noiseSound.preload = 'auto'

    // 오디오 로드 에러 핸들링
    noiseSound.onerror = (e) => {
      console.error('오디오 로드 에러:', e)
      console.log('현재 오디오 소스:', noiseSound.src)
      console.log('오디오 에러 코드:', noiseSound.error?.code)
      console.log('오디오 에러 메시지:', noiseSound.error?.message)
      setDebugInfo('오디오 로드 실패: ' + (noiseSound.error?.message || '알 수 없는 에러'))
    }

    // 오디오 로드 성공 핸들링
    noiseSound.oncanplaythrough = () => {
      console.log('오디오 로드 성공')
      setDebugInfo('오디오 로드 완료')
    }

    // iOS에서 오디오 재생을 위한 설정
    const setupAudio = async () => {
      console.log('오디오 초기화 시작')
      try {
        const noiseSound = noiseSoundRef.current
        noiseSound.load()
        
        // iOS에서 필요한 초기 재생 시도
        await noiseSound.play()
        noiseSound.pause() // 바로 일시정지
        noiseSound.currentTime = 0 // 시작 위치로 되돌림
        
        // TTS 초기화도 함께 수행
        if ('speechSynthesis' in window) {
          console.log('TTS 초기화 시작')
          window.speechSynthesis.cancel()
          
          ttsRef.current = new SpeechSynthesisUtterance(originalText)
          ttsRef.current.lang = 'ko-KR'
          ttsRef.current.rate = 1.0
          ttsRef.current.pitch = 1.0
          ttsRef.current.volume = 1.0

          // TTS 이벤트 핸들러 설정
          ttsRef.current.onend = () => {
            console.log('TTS 재생 완료')
          }

          ttsRef.current.onerror = (event) => {
            console.error('TTS 에러:', event)
            setDebugInfo('TTS 에러 발생: ' + event.error)
          }

          ttsRef.current.onstart = () => {
            console.log('TTS 재생 시작')
            setDebugInfo('TTS 재생 중')
          }
        }

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
      document.removeEventListener('touchstart', setupAudio)
    }

    // 모바일과 데스크탑 모두에서 초기화 실행
    if ('ontouchstart' in window) {
      // 모바일 디바이스
      document.addEventListener('touchstart', setupAudio)
    } else {
      // 데스크탑
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

  useEffect(() => {
    console.log('💡 isPlaying 상태 변경:', isPlaying)
  }, [isPlaying])

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

  // 볼륨 업데이트
  useEffect(() => {
    console.log('볼륨 업데이트 시도:', {
      isPlaying,
      hasNoiseRef: !!noiseSoundRef.current,
      hasTTSRef: !!ttsRef.current,
      maxAngleDiff,
      tolerance,
      maxDistance,
      currentNoiseVolume: noiseSoundRef.current?.volume,
      currentTTSVolume: ttsRef.current?.volume,
      isSpeaking: window.speechSynthesis?.speaking
    })

    if (!isPlaying) {
      console.log('오디오가 재생 중이 아님')
      return
    }

    if (!noiseSoundRef.current) {
      console.log('노이즈 사운드 레퍼런스가 없음')
      return
    }

    if (!ttsRef.current) {
      console.log('TTS 레퍼런스가 없음')
      return
    }

    // 목표 각도 범위 안에 들어왔는지 확인
    const isInTargetAngle = maxAngleDiff <= tolerance

    // TTS 볼륨 계산 (각도가 가까울수록 크게)
    const ttsVolume = maxAngleDiff <= tolerance ? 1 : 
                     maxAngleDiff >= maxDistance ? 0 :
                     1 - (maxAngleDiff - tolerance) / (maxDistance - tolerance)
    
    // 노이즈 볼륨 계산 (각도가 멀수록 크게)
    const noiseVolume = maxAngleDiff <= tolerance ? 0 :
                      maxAngleDiff >= maxDistance ? 1 :
                      (maxAngleDiff - tolerance) / (maxDistance - tolerance)

    console.log('볼륨 계산 결과:', { 
      ttsVolume, 
      noiseVolume, 
      isInTargetAngle,
      maxAngleDiff,
      tolerance 
    })

    // TTS 볼륨 조절 및 재생 제어
    if (ttsRef.current) {
      ttsRef.current.volume = Math.max(0, Math.min(1, ttsVolume))
      console.log('TTS 볼륨 설정:', ttsRef.current.volume)
      
      // 목표 각도 범위 안에 들어왔을 때 TTS 재생
      if (isInTargetAngle) {
        if (!window.speechSynthesis.speaking) {
          console.log('목표 각도 도달: TTS 재생 시작')
          setDebugInfo('목표 각도 도달: TTS 재생 중')
          
          // 처음 재생하는 경우에만 새로운 TTS 인스턴스 생성
          if (!ttsRef.current.text) {
            ttsRef.current = new SpeechSynthesisUtterance(originalText)
            ttsRef.current.lang = 'ko-KR'
            ttsRef.current.rate = 1.0
            ttsRef.current.pitch = 1.0
            ttsRef.current.volume = 1.0

            // TTS 이벤트 핸들러 설정
            ttsRef.current.onend = () => {
              console.log('TTS 재생 완료')
            }
          }

          // TTS 재생 시작
          window.speechSynthesis.speak(ttsRef.current)
        }
      } else {
        // 목표 각도를 벗어났을 때 TTS 일시 중지
        if (window.speechSynthesis.speaking) {
          console.log('목표 각도 벗어남: TTS 일시 중지')
          setDebugInfo('목표 각도 벗어남: TTS 일시 중지')
          window.speechSynthesis.pause()
        }
      }
    }

    // 노이즈 볼륨 적용
    noiseSoundRef.current.volume = Math.max(0, Math.min(1, noiseVolume))
    console.log('노이즈 볼륨 설정:', noiseSoundRef.current.volume)
    
    setDebugInfo(`각도: ${maxAngleDiff.toFixed(1)}° | TTS: ${ttsVolume.toFixed(2)} | 노이즈: ${noiseVolume.toFixed(2)}`)
  }, [isPlaying, maxAngleDiff, tolerance, maxDistance, setDebugInfo, originalText])

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

useEffect(() => {
  console.log('💡 전달된 상태 값 확인:', {
    maxAngleDiff,
    tolerance,
    maxDistance
  })
}, [maxAngleDiff, tolerance, maxDistance])

export default AudioController 