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
  const soundRef = useRef(new Audio(process.env.PUBLIC_URL + '/sound1.mp3'))

  // 목표 각도 및 허용 범위 설정
  const targetBeta = 45
  const targetGamma = -60
  const tolerance = 15
  const maxBlur = 10
  const maxDistance = 45 // 최대 거리 (각도 차이)

  const title = "보이지 않는 조각들: 공기조각"
  const originalText = `로비 공간에 들어서면, 하나의 좌대가 놓여 있습니다. 당신은 무엇을 기대하고 계셨나요? 조각상이 보일 거로 생각하지 않으셨나요? 하지만 이 좌대 위에는 아무것도 보이지 않습니다. 송예슬 작가의 <보이지 않는 조각들: 공기조각>은 눈에 보이지 않는 감각 조각이며 예술적 실험입니다.[다음]`

  // 오디오 초기화
  useEffect(() => {
    const audio = soundRef.current
    audio.loop = true
    audio.volume = 1

    // iOS에서 오디오 재생을 위한 설정
    const setupAudio = () => {
      audio.load()
      document.removeEventListener('touchstart', setupAudio)
    }
    document.addEventListener('touchstart', setupAudio)

    return () => {
      audio.pause()
      audio.currentTime = 0
      document.removeEventListener('touchstart', setupAudio)
    }
  }, [])

  // 오디오 재생 핸들러
  const handleAudioStart = async () => {
    try {
      console.log('Starting audio playback') // 디버깅용 로그
      await soundRef.current.play()
      console.log('Audio playing successfully') // 디버깅용 로그
      setIsPlaying(true)
      setShowAudioButton(false)
    } catch (error) {
      console.error('Audio play failed:', error)
      // 오류 발생 시 버튼 유지
      setShowAudioButton(true)
    }
  }

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
      console.log('Orientation disabled') // 디버깅용 로그
      return
    }

    const { beta, gamma } = event
    if (beta !== null && gamma !== null) {  // null 체크 추가
      setCurrentAngles({ beta, gamma }) // 현재 각도 저장
      
      const betaDiff = Math.abs(beta - targetBeta)
      const gammaDiff = Math.abs(gamma - targetGamma)
      
      // 각도 차이에 따른 블러 계산 로직 개선
      const maxAngleDiff = Math.max(betaDiff, gammaDiff)
      const normalizedDiff = Math.min(maxAngleDiff, maxDistance) / maxDistance
      const blur = maxBlur * normalizedDiff
      
      console.log(`Beta diff: ${betaDiff.toFixed(2)}, Gamma diff: ${gammaDiff.toFixed(2)}, Blur: ${blur.toFixed(2)}`) // 디버깅용 로그
      
      setBlurAmount(blur)

      // 각도에 따른 오디오 볼륨 조절
      if (soundRef.current) {
        const volume = 1 - normalizedDiff // 각도가 맞을수록 볼륨 증가
        soundRef.current.volume = volume
        console.log('Audio volume:', volume.toFixed(2)) // 디버깅용 로그
      }
    }
  }, [isOrientationEnabled, targetBeta, targetGamma, maxDistance, maxBlur])

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
    </div>
  )
}

export default ExhibitionText