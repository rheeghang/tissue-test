import React, { useState, useEffect, useCallback } from 'react'
import RotatedText from './RotatedText'
import AudioController from './AudioController'

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
  const [maxAngleDiff, setMaxAngleDiff] = useState(0)

  // 목표 각도 및 허용 범위 설정
  const targetBeta = 45
  const targetGamma = -60
  const tolerance = 25  // 완전히 선명해지는 범위
  const clearThreshold = 35  // 읽을 수 있는 범위
  const maxBlur = 30
  const maxDistance = 45 // 최대 거리 (각도 차이)

  const title = "보이지 않는 조각들: 공기조각"
  const originalText = `로비 공간에 들어서면, 하나의 좌대가 놓여 있습니다. 당신은 무엇을 기대하고 계셨나요? 조각상이 보일 거로 생각하지 않으셨나요? 하지만 이 좌대 위에는 아무것도 보이지 않습니다. 송예슬 작가의 <보이지 않는 조각들: 공기조각>은 눈에 보이지 않는 감각 조각이며 예술적 실험입니다. [다음]`

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
    try {
      // 방향 감지 권한 요청
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const orientationPermission = await DeviceOrientationEvent.requestPermission();
        if (orientationPermission === 'granted') {
          // 방향 감지 권한 획득 후 처리
          setPermissionGranted(true);
          setIsOrientationEnabled(true);
          
          // AudioContext 초기화
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          await audioContext.resume();
          console.log('AudioContext 초기화 완료');
          
          // 약간의 지연 후 오디오 초기화
          setTimeout(() => {
            setIsPlaying(true);
            console.log('오디오 재생 시작');
          }, 100);
        } else {
          console.log('iOS 권한 거부됨');
          setPermissionGranted(false);
          setIsOrientationEnabled(false);
        }
      }

      // 모션 감지 권한 요청
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        const motionPermission = await DeviceMotionEvent.requestPermission();
        if (motionPermission === 'granted') {
          // 모션 감지 권한 획득 후 처리
        }
      }

      // 모든 권한이 허용되면 모달 닫기
      setShowPermissionModal(false);
    } catch (error) {
      console.error('권한 요청 실패:', error);
    }
  };

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
      setMaxAngleDiff(maxAngleDiff)
      
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
    }
  }, [isOrientationEnabled, targetBeta, targetGamma, tolerance, clearThreshold, maxDistance, maxBlur])

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

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const isInTargetAngle = maxAngleDiff <= tolerance
    setDebugInfo(`각도차: ${maxAngleDiff.toFixed(1)}, 목표도달: ${isInTargetAngle ? 'Y' : 'N'}`)
  }, [isPlaying, maxAngleDiff, tolerance])

  // 각도에 따른 텍스트 블러 효과
  const getBlurAmount = () => {
    if (maxAngleDiff <= tolerance) {
      return 0 // 목표 각도에 도달하면 블러 없음
    }
    // 각도 차이가 클수록 블러가 강해짐
    return Math.min(8, (maxAngleDiff / maxDistance) * 8)
  }

  useEffect(() => {
    // 디버깅용 로그
    console.log('\n=== 각도 상태 ===')
    console.log('🎯 각도차이:', maxAngleDiff.toFixed(2))
    console.log('🎯 허용오차:', tolerance)
    console.log('🎯 최대거리:', maxDistance)
    console.log('================\n')
  }, [maxAngleDiff, tolerance, maxDistance])

  return (
    <div 
      className="flex flex-col items-center min-h-screen bg-exhibition-bg overflow-hidden relative"
    >
      <div className="w-full pt-[10px]">
        <RotatedText text={originalText} title={title} blurAmount={getBlurAmount()} />
      </div>
      
      {/* iOS 권한 요청 모달 */}
      {isIOS && showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h2 className="text-xl font-bold mb-4">권한 필요</h2>
            <p className="mb-4">이 기능을 사용하기 위해서는 기기의 방향 감지와 모션 감지 권한이 필요합니다.</p>
            <button
              onClick={handlePermissionRequest}
              className="w-full bg-blue-500 text-black py-2 px-4 rounded hover:bg-blue-600"
            >
              권한 허용하기
            </button>
          </div>
        </div>
      )}

      {/* AudioController 컴포넌트 */}
      <AudioController
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        showAudioButton={showAudioButton}
        setShowAudioButton={setShowAudioButton}
        setDebugInfo={setDebugInfo}
        originalText={originalText}
        maxAngleDiff={maxAngleDiff} 
        tolerance={tolerance}
        maxDistance={maxDistance}
      />

      {/* 각도 표시 footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-black text-xs z-50">
        <div className="bg-white/80 inline-block px-4 py-2 rounded-full shadow-lg border border-gray-200">
          β01: {currentAngles.beta?.toFixed(1) || 0}° (목표: {targetBeta}°) | 
          γ: {currentAngles.gamma?.toFixed(1) || 0}° (목표: {targetGamma}°)
        </div>
      </div>

      {/* 디버그 정보 표시 */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-white/80 px-4 py-2 rounded-full shadow-lg border border-gray-200 text-black text-xs">
        </div>
      </div>
    </div>
  )
}

export default ExhibitionText