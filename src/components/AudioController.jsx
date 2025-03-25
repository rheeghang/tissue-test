import React, { useEffect, useRef, useState, useCallback } from 'react'

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
  const lastUpdateRef = useRef(0) // 마지막 업데이트 시간 추적
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isOrientationEnabled, setIsOrientationEnabled] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  // TTS 상태 관리
  const [ttsState, setTtsState] = useState({
    isSpeaking: false,
    isPaused: false,
    isReady: false
  });

  // TTS 상태 초기화 함수
  const resetTTS = useCallback(() => {
    return new Promise((resolve) => {
      if (window.speechSynthesis.speaking) {
        console.log('🔄 기존 TTS 중단')
        window.speechSynthesis.cancel()
      }

      setTimeout(() => {
        if (ttsRef.current) {
          console.log('🎯 TTS 재생 시도')
          window.speechSynthesis.speak(ttsRef.current)
          resolve()
        }
      }, 100)
    })
  }, [])

  // TTS 이벤트 핸들러 설정
  const setupTTSEventHandlers = useCallback((utterance) => {
    if (!utterance) return
    
    let wordCount = 0
    
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        wordCount++
        currentWordIndexRef.current = Math.min(
          wordCount,
          wordsArrayRef.current.length - 1
        )
      }
    }

    utterance.onend = () => {
      currentWordIndexRef.current = 0
      wordCount = 0
    }

    utterance.onerror = (event) => {
      console.error('TTS 에러:', event)
      resetTTS().catch(error => {
        console.error('❌ TTS 재생 실패:', error)
      })
      setDebugInfo('TTS 에러: ' + event.error)
    }

    utterance.onstart = () => {
      console.log('TTS 재생 시작')
    }
  }, [resetTTS, setDebugInfo])

  const handlePermissionRequest = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
          setShowPermissionModal(false)
          setIsOrientationEnabled(true)
          
          // 권한 허용과 동시에 오디오 초기화 및 재생
          const noiseSound = initAudio()
          if (noiseSound) {
            try {
              await noiseSound.play()
              console.log('✅ 권한 허용 후 노이즈 사운드 재생 시작')
              setIsPlaying(true)
              
              const isInTargetAngle = maxAngleDiff <= tolerance
              noiseSound.volume = isInTargetAngle ? 0 : 1
              
              if (isInTargetAngle && ttsRef.current) {
                console.log('✅ 초기 목표 각도 진입')
                window.speechSynthesis.speak(ttsRef.current)
              }
            } catch (playError) {
              console.error('오디오 재생 실패:', playError)
              setDebugInfo('오디오 재생 실패: ' + playError.message)
            }
          }
        } else {
          setShowPermissionModal(false)
          setDebugInfo('각도 센서 권한이 거부되었습니다.')
        }
      } catch (error) {
        console.error('권한 요청 실패:', error)
        setShowPermissionModal(false)
        setDebugInfo('권한 요청 실패: ' + error.message)
      }
    } else {
      setShowPermissionModal(false)
    }
  }

  // 오디오 초기화
  useEffect(() => {
    const initAudio = () => {
      try {
        if (!window.speechSynthesis) {
          console.error('TTS를 지원하지 않는 브라우저입니다.')
          return null
        }

        const noiseSound = new Audio(process.env.PUBLIC_URL + '/sound1.mp3')
        noiseSound.loop = true
        noiseSound.volume = 1
        noiseSound.preload = 'auto'
        noiseSoundRef.current = noiseSound

        const utterance = new SpeechSynthesisUtterance(wordsArrayRef.current.join(' '))
        utterance.lang = 'ko-KR'
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1

        setupTTSEventHandlers(utterance)
        ttsRef.current = utterance

        return noiseSound
      } catch (error) {
        console.error('오디오 초기화 실패:', error)
        return null
      }
    }

    // 최초 클릭 이벤트에서 사운드 재생
    const handleUserInteraction = () => {
      console.log('🔊 첫 클릭 이벤트 발생 - 사운드 재생 시도')
      
      // iOS가 아닌 경우 바로 오디오 재생
      if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
        const noiseSound = initAudio()
        if (noiseSound) {
          noiseSound.play()
            .then(() => {
              setIsPlaying(true)
              console.log('✅ 노이즈 사운드 재생 시작')
            })
            .catch(error => {
              console.error('오디오 재생 실패:', error)
              setDebugInfo('오디오 재생 실패: ' + error.message)
            })
        }
      }
      
      document.removeEventListener('click', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      if (noiseSoundRef.current) {
        noiseSoundRef.current.pause()
        noiseSoundRef.current = null
      }
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }, [maxAngleDiff, tolerance, setupTTSEventHandlers, setDebugInfo, setIsPlaying])

  // 각도에 따른 오디오 제어
  useEffect(() => {
    if (!isPlaying) return

    const now = Date.now()
    if (now - lastUpdateRef.current > 200) {
      lastUpdateRef.current = now
      if (noiseSoundRef.current && ttsRef.current) {
        const isInTargetAngle = maxAngleDiff <= tolerance
        const newVolume = isInTargetAngle ? 0 : 1
        noiseSoundRef.current.volume = newVolume

        if (isInTargetAngle) {
          console.log('✅ 목표 각도 진입 - TTS 재생')
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(ttsRef.current)
        } else {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause()
          }
        }

        setDebugInfo(`
          각도차: ${maxAngleDiff.toFixed(1)}° | 
          허용범위: ${tolerance}° | 
          노이즈: ${noiseSoundRef.current.volume} | 
          TTS: ${isInTargetAngle ? '재생중' : '정지'} | 
          현재 단어: ${wordsArrayRef.current[currentWordIndexRef.current]} |
          목표각도: ${isInTargetAngle ? '진입' : '이탈'} |
          재생상태: ${isPlaying ? '재생중' : '정지'}
        `)
      }
    }
  }, [maxAngleDiff, tolerance, isPlaying, setDebugInfo])

  return (
    <>
      {/* 디버그 정보 표시 */}
      <div className="fixed bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
        <div className="font-bold mb-2">디버그 정보:</div>
        <div>각도차: {maxAngleDiff.toFixed(1)}°</div>
        <div>허용범위: {tolerance}°</div>
        <div>노이즈 볼륨: {noiseSoundRef.current?.volume || 0}</div>
        <div>TTS 상태: {maxAngleDiff <= tolerance ? '재생중' : '정지'}</div>
        <div>현재 단어: {wordsArrayRef.current[currentWordIndexRef.current]}</div>
        <div>재생 중: {isPlaying ? '예' : '아니오'}</div>
        <div>목표각도: {maxAngleDiff <= tolerance ? '진입' : '이탈'}</div>
      </div>
    </>
  )
}

export default AudioController