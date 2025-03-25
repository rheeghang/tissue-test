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
    if (!isPlaying) {
      return
    }

    const isInTargetAngle = maxAngleDiff <= tolerance
    const noiseVolume = Math.min(1, maxAngleDiff / maxDistance)
    const ttsVolume = isInTargetAngle ? 1 : 0

    // 이전 상태와 비교를 위한 값들
    const prevNoiseVolume = noiseSoundRef.current?.volume || 0
    const prevTTSVolume = ttsRef.current?.volume || 0
    const wasSpeaking = window.speechSynthesis?.speaking || false

    // 노이즈 사운드 볼륨 설정 (볼륨이 변경될 때만 로그)
    if (noiseSoundRef.current && Math.abs(prevNoiseVolume - noiseVolume) > 0.1) {
      noiseSoundRef.current.volume = noiseVolume
      console.log('🔊 노이즈 볼륨:', noiseVolume.toFixed(2))
    }

    // TTS 제어
    if (ttsRef.current) {
      // 볼륨이 크게 변경될 때만 로그
      if (Math.abs(prevTTSVolume - ttsVolume) > 0.1) {
        ttsRef.current.volume = ttsVolume
        console.log('🗣 TTS 볼륨:', ttsVolume.toFixed(2))
      }

      // 목표 각도 도달 시 TTS 재생 (이전에 재생 중이지 않았을 때만)
      if (isInTargetAngle && !wasSpeaking) {
        console.log('\n=== TTS 재생 시작 ===')
        console.log('- 현재 각도 차이:', maxAngleDiff.toFixed(2))
        console.log('- 목표 각도 범위:', tolerance)
        
        try {
          // TTS 재생 전 상태 확인
          if (!ttsRef.current.text) {
            console.log('- TTS 텍스트 재설정')
            ttsRef.current.text = originalText
            ttsRef.current.lang = 'ko-KR'
            ttsRef.current.rate = 1.0
            ttsRef.current.pitch = 1.0
          }

          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(ttsRef.current)
          
          // TTS 재생 확인
          setTimeout(() => {
            const isSpeaking = window.speechSynthesis.speaking
            console.log('- TTS 재생 상태:', isSpeaking ? '재생 중' : '재생 실패')
            console.log('===================\n')
          }, 100)
        } catch (error) {
          console.error('\n=== TTS 재생 실패 ===')
          console.error('- 에러:', error.message)
          console.error('===================\n')
        }
      }
    }

    // 디버그 정보는 큰 변화가 있을 때만 업데이트
    if (Math.abs(prevNoiseVolume - noiseVolume) > 0.1 || Math.abs(prevTTSVolume - ttsVolume) > 0.1) {
      setDebugInfo(`각도차: ${maxAngleDiff.toFixed(1)}, 노이즈: ${noiseVolume.toFixed(1)}, TTS: ${ttsVolume.toFixed(1)}`)
    }
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


console.log('🗣️ TTS 상태:', {
  speaking: window.speechSynthesis.speaking,
  pending: window.speechSynthesis.pending,
  paused: window.speechSynthesis.paused
})

const noiseSound = noiseSoundRef.current
console.log('🔊 노이즈 상태:', {
  readyState: noiseSound?.readyState,
  paused: noiseSound?.paused,
  volume: noiseSound?.volume,
  error: noiseSound?.error
})

export default AudioController 