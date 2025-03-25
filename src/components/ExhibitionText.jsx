import React, { useState, useEffect, useCallback, useRef } from 'react'
import RotatedText from './RotatedText'

const ExhibitionText = () => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [isOrientationEnabled, setIsOrientationEnabled] = useState(true)
  const [currentAngles, setCurrentAngles] = useState({ beta: 0, gamma: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAudioButton, setShowAudioButton] = useState(true)
  const [debugInfo, setDebugInfo] = useState('')
  
  
  // 오디오 레퍼런스들
  const noiseSoundRef = useRef(new Audio(process.env.PUBLIC_URL + '/assets/sound1.mp3'))
  const ttsRef = useRef(null)

  // 목표 각도 및 허용 범위 설정
  const targetBeta = 45
  const targetGamma = -60
  const tolerance = 35  // 완전히 선명해지는 범위
  const clearThreshold = 45  // 읽을 수 있는 범위
  const maxBlur = 10
  const maxDistance = 45 // 최대 거리 (각도 차이)

  const title = "보이지 않는 조각들: 공기조각"
  const originalText = `로비 공간에 들어서면, 하나의 좌대가 놓여 있습니다. 당신은 무엇을 기대하고 계셨나요? 조각상이 보일 거로 생각하지 않으셨나요? 하지만 이 좌대 위에는 아무것도 보이지 않습니다. 송예슬 작가의 <보이지 않는 조각들: 공기조각>은 눈에 보이지 않는 감각 조각이며 예술적 실험입니다.[다음]`

  // 오디오 재생 핸들러
  const handleAudioStart = async () => {
    try {
      console.log('오디오 재생 시도')
      console.log('오디오 소스:', noiseSoundRef.current.src)
      
      // TTS 초기화
      if ('speechSynthesis' in window) {
        console.log('TTS 초기화 시작')
        ttsRef.current = new SpeechSynthesisUtterance(originalText)
        ttsRef.current.lang = 'ko-KR'
        ttsRef.current.rate = 1.0
        ttsRef.current.pitch = 1.0
        ttsRef.current.volume = 0

        // TTS 이벤트 핸들러
        ttsRef.current.onend = () => {
          console.log('TTS 재생 완료')
          if (ttsRef.current && ttsRef.current.volume > 0.1) {
            console.log('TTS 재시작')
            window.speechSynthesis.speak(ttsRef.current)
          }
        }

        // TTS 에러 핸들러
        ttsRef.current.onerror = (event) => {
          console.error('TTS 에러:', event)
          setDebugInfo('TTS 에러 발생')
        }

        // TTS 시작 핸들러
        ttsRef.current.onstart = () => {
          console.log('TTS 재생 시작')
          setDebugInfo('TTS 재생 중')
        }

        // 초기 TTS 재생은 지연 후 시도
        setTimeout(() => {
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(ttsRef.current)
        }, 1000) // 1초 지연
      }

      // 노이즈 사운드 재생
      await noiseSoundRef.current.play()
      console.log('오디오 재생 성공')
      setIsPlaying(true)
      setShowAudioButton(false)
    } catch (error) {
      console.error('오디오 재생 실패:', error)
      console.log('오디오 상태:', {
        src: noiseSoundRef.current.src,
        readyState: noiseSoundRef.current.readyState,
        error: noiseSoundRef.current.error
      })
      setShowAudioButton(true)
    }
  }

  // TTS 초기화 useEffect 제거 (handleAudioStart로 이동)
  useEffect(() => {
    return () => {
      if (ttsRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // 오디오 초기화
  useEffect(() => {
    const noiseSound = noiseSoundRef.current

    // 노이즈 사운드 설정
    noiseSound.loop = true
    noiseSound.volume = 0

    // 오디오 로드 에러 핸들링
    noiseSound.onerror = (e) => {
      console.error('오디오 로드 에러:', e)
      console.log('현재 오디오 소스:', noiseSound.src)
      console.log('PUBLIC_URL:', process.env.PUBLIC_URL)
    }

    // 오디오 로드 성공 핸들링
    noiseSound.oncanplaythrough = () => {
      console.log('오디오 로드 성공')
    }

    // iOS에서 오디오 재생을 위한 설정
    const setupAudio = () => {
      console.log('오디오 로드 시작')
      noiseSound.load()
      document.removeEventListener('touchstart', setupAudio)
    }
    document.addEventListener('touchstart', setupAudio)

    return () => {
      noiseSound.pause()
      noiseSound.currentTime = 0
      document.removeEventListener('touchstart', setupAudio)
    }
  }, [])

  // iOS 디바이스 체크
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(isIOSDevice)
    if (isIOSDevice) {
      setShowPermissionModal(true)
    }
  }, [])

  // 키보드 이벤트 핸들러
  const handleKeyPress = useCallback((event) => {
    if (event.key.toLowerCase() === 'f') {
      console.log('F key pressed') // 디버깅용 로그
      setIsOrientationEnabled(false)
      setBlurAmount(0)
      // 방향 감지 이벤트 리스너 제거
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [setBlurAmount, setIsOrientationEnabled])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  // iOS 권한 요청 처리
  const handlePermissionRequest = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
          setShowPermissionModal(false)
          setIsOrientationEnabled(true)
        } else {
          setShowPermissionModal(false)
        }
      } catch (error) {
        console.error('권한 요청 실패:', error)
        setShowPermissionModal(false)
      }
    } else {
      setShowPermissionModal(false)
    }
  }

  // 방향 감지 이벤트 핸들러
  const handleOrientation = useCallback((event) => {
    if (!isOrientationEnabled) {
      setDebugInfo('Orientation disabled')
      return
    }

    const { beta, gamma } = event
    if (beta !== null && gamma !== null) {
      setCurrentAngles({ beta, gamma })
      
      const betaDiff = Math.abs(beta - targetBeta)
      const gammaDiff = Math.abs(gamma - targetGamma)
      const maxAngleDiff = Math.max(betaDiff, gammaDiff)
      
      // 블러 계산
      let blur
      if (maxAngleDiff <= tolerance) {
        blur = 0
      } else if (maxAngleDiff <= clearThreshold) {
        const normalizedDiff = (maxAngleDiff - tolerance) / (clearThreshold - tolerance)
        blur = 3 * normalizedDiff
      } else {
        const normalizedDiff = (maxAngleDiff - clearThreshold) / (maxDistance - clearThreshold)
        blur = 3 + (maxBlur - 3) * normalizedDiff
      }
      
      setBlurAmount(blur)

      // 오디오 볼륨 조절
      if (isPlaying) {
        // TTS 볼륨 계산 (각도가 가까울수록 크게)
        const ttsVolume = maxAngleDiff <= tolerance ? 1 : 
                         maxAngleDiff >= maxDistance ? 0 :
                         1 - (maxAngleDiff - tolerance) / (maxDistance - tolerance)
        
        // 노이즈 볼륨 계산 (각도가 멀수록 크게)
        const noiseVolume = maxAngleDiff <= tolerance ? 0 :
                          maxAngleDiff >= maxDistance ? 1 :
                          (maxAngleDiff - tolerance) / (maxDistance - tolerance)

        // TTS 볼륨 조절
        if (ttsRef.current) {
          ttsRef.current.volume = Math.max(0, Math.min(1, ttsVolume))
          
          // TTS 재생/중지 로직
          if (ttsVolume > 0.1) {  // 볼륨이 0.1 이상일 때만 재생
            if (!window.speechSynthesis.speaking) {
              setDebugInfo('TTS 시작 시도')
              // TTS 재생도 지연 후 시도
              setTimeout(() => {
                window.speechSynthesis.cancel()
                window.speechSynthesis.speak(ttsRef.current)
              }, 500) // 0.5초 지연
            }
          } else {
            if (window.speechSynthesis.speaking) {
              setDebugInfo('TTS 중지')
              window.speechSynthesis.cancel()
            }
          }
        }

        // 노이즈 볼륨 적용
        noiseSoundRef.current.volume = Math.max(0, Math.min(1, noiseVolume))
        
        setDebugInfo(`각도: ${maxAngleDiff.toFixed(1)}° | TTS: ${ttsVolume.toFixed(2)} | 노이즈: ${noiseVolume.toFixed(2)}`)
      }
    }
  }, [isOrientationEnabled, targetBeta, targetGamma, tolerance, clearThreshold, maxDistance, maxBlur, isPlaying])

  // 방향 감지 이벤트 리스너 등록
  useEffect(() => {
    console.log('Orientation enabled:', isOrientationEnabled) // 디버깅용 로그
    
    let orientationHandler = null;
    
    if (window.DeviceOrientationEvent && isOrientationEnabled) {
      console.log('Adding orientation listener') // 디버깅용 로그
      orientationHandler = handleOrientation;
      window.addEventListener('deviceorientation', orientationHandler)
    }

    return () => {
      if (orientationHandler) {
        console.log('Removing orientation listener') // 디버깅용 로그
        window.removeEventListener('deviceorientation', orientationHandler)
      }
    }
  }, [isOrientationEnabled, handleOrientation])

  return (
    <div 
      className="flex flex-col items-center min-h-screen bg-exhibition-bg overflow-hidden relative"
    >
      <div className="w-full pt-[10px]">
        <RotatedText text={originalText} title={title} blurAmount={blurAmount} />
      </div>
      
      {/* iOS 권한 요청 모달 */}
      {isIOS && showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h2 className="text-xl font-bold mb-4">방향 감지 권한 필요</h2>
            <p className="mb-4">이 기능을 사용하기 위해서는 기기의 방향 감지 권한이 필요합니다.</p>
            <button
              onClick={handlePermissionRequest}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              권한 허용하기
            </button>
          </div>
        </div>
      )}

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

      {/* 각도 표시 footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-black text-xs z-50">
        <div className="bg-white/80 inline-block px-4 py-2 rounded-full shadow-lg border border-gray-200">
          β: {currentAngles.beta?.toFixed(1) || 0}° (목표: {targetBeta}°) | 
          γ: {currentAngles.gamma?.toFixed(1) || 0}° (목표: {targetGamma}°)
        </div>
      </div>

      {/* 디버그 정보 표시 */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-white/80 px-4 py-2 rounded-full shadow-lg border border-gray-200 text-black text-xs">
          {debugInfo}
        </div>
      </div>
    </div>
  )
}

export default ExhibitionText