import React, { useEffect, useRef, useState } from 'react'

const AudioController = ({ 
  isPlaying, 
  setIsPlaying, 
  setDebugInfo,
  originalText,
  maxAngleDiff,
  tolerance,
  title = "보이지 않는 조각들: 공기조각",
  artist = "송예슬"
}) => {
  const noiseSoundRef = useRef(null)
  const lastUpdateRef = useRef(0)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isOrientationEnabled, setIsOrientationEnabled] = useState(false)
  const [audioStatus, setAudioStatus] = useState('초기화 대기')
  const [ttsStatus, setTtsStatus] = useState('초기화 대기')
  const [hasUserInteraction, setHasUserInteraction] = useState(false)
  const wordsArrayRef = useRef(`${title}. 작가 ${artist}. ${originalText}`.split(' '))
  const lastAngleState = useRef(null) // 'in' 또는 'out'
  const isSpeakingRef = useRef(false)
  const lastDebugInfoRef = useRef('')

  // 사용자 상호작용 처리
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasUserInteraction) {
        setHasUserInteraction(true)
        setAudioStatus('사용자 상호작용 감지, 오디오 초기화 시작...')
        if (isPlaying) {
          initAudio()
        }
      }
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [hasUserInteraction, isPlaying])

  // iOS 권한 요청 및 방향 감지 초기화
  useEffect(() => {
    const checkPermissions = async () => {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission()
          if (permission === 'granted') {
            setPermissionGranted(true)
            setIsOrientationEnabled(true)
            setDebugInfo(prev => prev + '\niOS 권한이 허용되었습니다.')
          } else {
            setPermissionGranted(false)
            setIsOrientationEnabled(false)
            setDebugInfo(prev => prev + '\niOS 권한이 거부되었습니다.')
          }
        } catch (error) {
          console.error('iOS 권한 요청 실패:', error)
          setDebugInfo(prev => prev + '\niOS 권한 요청 실패: ' + error.message)
        }
      } else {
        // iOS가 아닌 경우
        setPermissionGranted(true)
        setIsOrientationEnabled(true)
        setDebugInfo(prev => prev + '\n일반 브라우저에서 실행 중입니다.')
      }
    }

    checkPermissions()
  }, [setDebugInfo])

  // 오디오 초기화 함수
  const initAudio = async () => {
    try {
      setAudioStatus('오디오 초기화 중...')
      
      if (noiseSoundRef.current) {
        noiseSoundRef.current.pause()
        noiseSoundRef.current = null
      }

      const noiseSound = new Audio(process.env.PUBLIC_URL + '/sound1.mp3')
      noiseSound.loop = true
      noiseSound.volume = 1
      noiseSoundRef.current = noiseSound

      // 오디오 로드 완료 대기
      await new Promise((resolve, reject) => {
        noiseSound.addEventListener('canplaythrough', resolve, { once: true })
        noiseSound.addEventListener('error', reject, { once: true })
        noiseSound.load()
      })

      setAudioStatus('오디오 로드 완료, 재생 시도 중...')
      
      // 오디오 재생 시도
      try {
        await noiseSound.play()
        setAudioStatus('오디오 재생 중')
        console.log('오디오 재생 시작')
      } catch (error) {
        setAudioStatus('오디오 재생 실패: ' + error.message)
        console.error('오디오 재생 실패:', error)
        throw error
      }

      return noiseSound
    } catch (error) {
      setAudioStatus('오디오 초기화 실패: ' + error.message)
      console.error('오디오 초기화 실패:', error)
      return null
    }
  }

  // 오디오 초기화 useEffect
  useEffect(() => {
    if (!isPlaying) {
      setAudioStatus('재생 중지됨')
      if (noiseSoundRef.current) {
        noiseSoundRef.current.pause()
        noiseSoundRef.current = null
      }
      return
    }

    if (!hasUserInteraction) {
      setAudioStatus('사용자 상호작용 대기 중...')
      return
    }

    const initializeAudio = async () => {
      try {
        const noiseSound = await initAudio()
        if (noiseSound) {
          const isInTargetAngle = maxAngleDiff <= tolerance
          noiseSound.volume = isInTargetAngle ? 0 : 1
          setAudioStatus(`오디오 재생 중 (볼륨: ${noiseSound.volume.toFixed(1)})`)
        }
      } catch (error) {
        setAudioStatus('오디오 재생 실패: ' + error.message)
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
  }, [isPlaying, maxAngleDiff, tolerance, hasUserInteraction])

  // 각도에 따른 오디오 제어
  useEffect(() => {
    if (!isPlaying || !noiseSoundRef.current || !hasUserInteraction) return

    const now = Date.now()
    if (now - lastUpdateRef.current > 1000) {
      lastUpdateRef.current = now

      const isInTargetAngle = maxAngleDiff <= tolerance
      const currentAngleState = isInTargetAngle ? 'in' : 'out'

      if (lastAngleState.current !== currentAngleState) {
        lastAngleState.current = currentAngleState

        if (currentAngleState === 'in') {
          // TTS 모드 진입
          if (noiseSoundRef.current) {
            noiseSoundRef.current.pause()
          }
          if (!isSpeakingRef.current) {
            const utterance = new SpeechSynthesisUtterance(wordsArrayRef.current.join(' '))
            utterance.lang = 'ko-KR'
            utterance.rate = 1.0
            utterance.pitch = 1.0
            utterance.volume = 1.0

            utterance.onstart = () => {
              isSpeakingRef.current = true
              setTtsStatus('TTS 재생 중')
              console.log('TTS 재생 시작')
            }

            utterance.onend = () => {
              isSpeakingRef.current = false
              setTtsStatus('TTS 재생 완료')
              console.log('TTS 재생 종료')
            }

            utterance.onerror = (event) => {
              isSpeakingRef.current = false
              setTtsStatus('TTS 오류: ' + event.error)
              console.error('TTS 오류:', event)
            }

            window.speechSynthesis.speak(utterance)
          }
        } else {
          // 노이즈 모드 진입
          window.speechSynthesis.cancel()
          isSpeakingRef.current = false
          setTtsStatus('TTS 정지됨')
          if (noiseSoundRef.current?.paused) {
            noiseSoundRef.current.play()
          }
          noiseSoundRef.current.volume = 1
          setAudioStatus(`오디오 재생 중 (볼륨: 1.0)`)
        }
      }

      const newDebugInfo = `
        각도차: ${maxAngleDiff.toFixed(1)}° | 
        허용범위: ${tolerance}° | 
        노이즈: ${noiseSoundRef.current.volume} | 
        TTS: ${isSpeakingRef.current ? '재생중' : '정지'} | 
        현재 단어: ${wordsArrayRef.current[0]} |
        목표각도: ${currentAngleState === 'in' ? '진입' : '이탈'} |
        재생상태: ${isPlaying ? '재생중' : '정지'} |
        iOS 권한: ${permissionGranted ? '허용됨' : '미허용'} |
        방향감지: ${isOrientationEnabled ? '활성화' : '비활성화'} |
        사용자상호작용: ${hasUserInteraction ? '완료' : '대기중'}
      `
      if (lastDebugInfoRef.current !== newDebugInfo) {
        lastDebugInfoRef.current = newDebugInfo
        setDebugInfo(newDebugInfo)
      }
    }
  }, [maxAngleDiff, tolerance, isPlaying, setDebugInfo, permissionGranted, isOrientationEnabled, hasUserInteraction])

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
        <div>각도차: {maxAngleDiff.toFixed(1)}°</div>
        <div>목표각도: {maxAngleDiff <= tolerance ? '진입' : '이탈'}</div>
        <div className="mt-2 font-bold">오디오 상태:{audioStatus}</div>
        <div>노이즈 볼륨: {noiseSoundRef.current?.volume || 0}</div>
        <div className="mt-2 font-bold">TTS 상태:{ttsStatus}</div>
        <div>재생 중: {isPlaying ? '예' : '아니오'}</div>
        <div>iOS 권한: {permissionGranted ? '허용됨' : '미허용'}</div>
        <div>방향감지: {isOrientationEnabled ? '활성화' : '비활성화'}</div>
        <div>사용자상호작용: {hasUserInteraction ? '완료' : '대기중'}</div>
      </div>
    </>
  )
}

export default AudioController