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

  // 오디오 초기화 함수
  const initAudio = useCallback(() => {
    try {
      if (!window.speechSynthesis) {
        console.error('TTS를 지원하지 않는 브라우저입니다.')
        return null
      }

      // 기존 오디오 객체가 있다면 제거
      if (noiseSoundRef.current) {
        noiseSoundRef.current.pause()
        noiseSoundRef.current = null
      }

      console.log('🎵 노이즈 사운드 초기화 시작')
      const noiseSound = new Audio(process.env.PUBLIC_URL + '/sound1.mp3')
      
      // 오디오 설정
      noiseSound.loop = true
      noiseSound.volume = 1
      noiseSound.preload = 'auto'
      
      // 오디오 로드 완료 확인
      noiseSound.addEventListener('canplaythrough', () => {
        console.log('🎵 노이즈 사운드 로드 완료')
      })

      // 오디오 에러 처리
      noiseSound.addEventListener('error', (e) => {
        console.error('🔴 노이즈 사운드 에러:', e)
        setDebugInfo('노이즈 사운드 에러: ' + e.message)
      })

      noiseSoundRef.current = noiseSound

      // TTS 설정
      console.log('🗣 TTS 초기화 시작')
      const utterance = new SpeechSynthesisUtterance(wordsArrayRef.current.join(' '))
      utterance.lang = 'ko-KR'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1

      setupTTSEventHandlers(utterance)
      ttsRef.current = utterance
      console.log('🗣 TTS 초기화 완료')

      return noiseSound
    } catch (error) {
      console.error('❌ 오디오 초기화 실패:', error)
      setDebugInfo('오디오 초기화 실패: ' + error.message)
      return null
    }
  }, [setupTTSEventHandlers, setDebugInfo])

  // 오디오 재생 시도 함수
  const tryPlayAudio = useCallback(async () => {
    try {
      if (!noiseSoundRef.current) {
        console.log('🔄 오디오 초기화 필요')
        const noiseSound = initAudio()
        if (!noiseSound) {
          throw new Error('오디오 초기화 실패')
        }
      }

      console.log('▶️ 노이즈 사운드 재생 시도')
      const playPromise = noiseSoundRef.current.play()
      
      if (playPromise !== undefined) {
        await playPromise
        console.log('✅ 노이즈 사운드 재생 시작')
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('❌ 오디오 재생 실패:', error)
      setDebugInfo('오디오 재생 실패: ' + error.message)
      
      // 자동 재생 정책으로 인한 실패인 경우
      if (error.name === 'NotAllowedError') {
        setDebugInfo('오디오 재생이 차단되었습니다. 화면을 클릭해주세요.')
      }
    }
  }, [initAudio, setIsPlaying, setDebugInfo])

  // 권한 요청 핸들러
  const handlePermissionRequest = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
          setShowPermissionModal(false)
          setIsOrientationEnabled(true)
          
          // 권한 허용 후 오디오 재생 시도
          await tryPlayAudio()
          
          // 각도에 따른 초기 상태 설정
          const isInTargetAngle = maxAngleDiff <= tolerance
          if (noiseSoundRef.current) {
            noiseSoundRef.current.volume = isInTargetAngle ? 0 : 1
          }
          
          if (isInTargetAngle && ttsRef.current) {
            console.log('✅ 초기 목표 각도 진입 - TTS 재생')
            window.speechSynthesis.speak(ttsRef.current)
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
      // 권한 요청이 필요없는 경우 바로 오디오 재생 시도
      await tryPlayAudio()
    }
  }

  // 오디오 초기화 useEffect
  useEffect(() => {
    if (!isPlaying) return

    const initializeAudio = async () => {
      try {
        console.log('🎵 오디오 초기화 시작')
        const noiseSound = initAudio()
        if (noiseSound) {
          // 오디오 로드 완료 대기
          await new Promise((resolve) => {
            noiseSound.addEventListener('canplaythrough', resolve, { once: true })
            noiseSound.load()
          })

          console.log('🎵 노이즈 사운드 로드 완료, 재생 시도')
          await noiseSound.play()
          console.log('✅ 노이즈 사운드 재생 시작')

          // 초기 각도에 따른 볼륨 설정
          const isInTargetAngle = maxAngleDiff <= tolerance
          noiseSound.volume = isInTargetAngle ? 0 : 1

          // 목표 각도 안에 있다면 TTS 재생
          if (isInTargetAngle && ttsRef.current) {
            console.log('✅ 초기 목표 각도 진입 - TTS 재생')
            window.speechSynthesis.cancel()
            window.speechSynthesis.speak(ttsRef.current)
          }
        }
      } catch (error) {
        console.error('❌ 오디오 초기화 실패:', error)
        setDebugInfo('오디오 초기화 실패: ' + error.message)
        
        if (error.name === 'NotAllowedError') {
          setDebugInfo('오디오 재생이 차단되었습니다. 화면을 클릭해주세요.')
        }
      }
    }

    initializeAudio()

    return () => {
      if (noiseSoundRef.current) {
        noiseSoundRef.current.pause()
        noiseSoundRef.current = null
      }
      window.speechSynthesis.cancel()
    }
  }, [isPlaying, initAudio, maxAngleDiff, tolerance, setDebugInfo])

  // 각도에 따른 오디오 제어
  useEffect(() => {
    if (!isPlaying || !noiseSoundRef.current) return

    const now = Date.now()
    if (now - lastUpdateRef.current > 50) { // 업데이트 간격을 50ms로 줄임
      lastUpdateRef.current = now
      
      const isInTargetAngle = maxAngleDiff <= tolerance
      const newVolume = isInTargetAngle ? 0 : 1

      // 볼륨 변경이 필요한 경우에만 적용
      if (noiseSoundRef.current.volume !== newVolume) {
        console.log(`🔊 노이즈 볼륨 변경: ${newVolume}`)
        noiseSoundRef.current.volume = newVolume
      }

      // TTS 상태 관리
      if (isInTargetAngle) {
        if (!window.speechSynthesis.speaking) {
          console.log('✅ 목표 각도 진입 - TTS 재생')
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(ttsRef.current)
        }
      } else {
        if (window.speechSynthesis.speaking) {
          console.log('❌ 목표 각도 이탈 - TTS 정지')
          window.speechSynthesis.cancel() // pause 대신 cancel 사용
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
  }, [maxAngleDiff, tolerance, isPlaying, setDebugInfo])

  return (
    <>
      {/* 디버그 정보 표시 */}
      <div className="fixed bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
        <div className="font-bold mb-2">디버그 정보:</div>
        <div>각도차: {maxAngleDiff.toFixed(1)}°</div>
        <div>노이즈 볼륨: {noiseSoundRef.current?.volume || 0}</div>
        <div>TTS 상태: {maxAngleDiff <= tolerance ? '재생중' : '정지'}</div>
        <div>현재 단어: {wordsArrayRef.current[currentWordIndexRef.current]}</div>
        <div>재생 중: {isPlaying ? '예' : '아니오'}</div>
        <div>목표각도: {maxAngleDiff <= tolerance ? '진입' : '이탈'}</div>
        <div>iOS 권한: {permissionGranted ? '허용됨' : '미허용'}</div>
        <div>방향감지: {isOrientationEnabled ? '활성화' : '비활성화'}</div>
      </div>
    </>
  )
}

export default AudioController