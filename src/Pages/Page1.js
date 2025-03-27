import React, { useState, useEffect, useCallback } from 'react'
import RotatedText from '../components/RotatedText'
import AudioController from '../components/AudioController'

const Page1 = ({ onMotionPermissionGranted }) => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [isOrientationEnabled, setIsOrientationEnabled] = useState(true)
  const [currentAngles, setCurrentAngles] = useState({ alpha: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAudioButton, setShowAudioButton] = useState(true)
  const [debugInfo, setDebugInfo] = useState('')
  const [maxAngleDiff, setMaxAngleDiff] = useState(0)

  // 목표 각도 및 허용 범위 설정
  const targetAlpha = 45  // 알파 값만 사용
  const tolerance = 25    // 완전히 선명해지는 범위
  const clearThreshold = 35  // 읽을 수 있는 범위
  const maxBlur = 30
  const maxDistance = 45 // 최대 거리 (각도 차이)

  const title = "코 없는 코끼리 no.2"
    const artist = "엄정순"
    const caption = "2024~2025, 설치, 고밀도 스티로폼,재생 플라스틱 플레이크, <br>금속, 230(h)X150(W)280(D)cm. 국립아시아문화전당 제작 지원, 작가 제공."
    const originalText = `이 설치작품은 엄정순 작가의 코 없는 코끼리 no.2입니다. 높이 2ｍ 30㎝, 너비 1m 50㎝, 길이 2ｍ 80㎝에 이르는 대형 작품은 철골 구조 위에 고밀도 스티로폼과 재생 플라스틱 플레이크를 덧붙여 제작되었고, 그 위를 투박한 질감의 도장으로 마감하여 표면은 매끄럽지 않습니다. 둥글고 묵직한 몸통은 실제 코끼리처럼 크고, 두툼한 다리로 땅을 단단히 딛고 있습니다. <br>[다음]`
  
    const originalText2 = `하지만 그 중심에서 중요한 것이 사라졌습니다. 코입니다. 작가는 이 코끼리를 ‘이방인’, ‘타자’, 그리고 ‘보이지 않는 것’의 상징으로 제시합니다. 우리는 코가 없는 이 형상을 보며 익숙한 이미지와 다름을 느끼고, 자연스럽게 질문하게 됩니다. <span class="font-serif italic">코가 없으면 코끼리가 아닐까요? 보이지 않으면 존재하지 않는 걸까요? 당신이 알고 있던 코끼리의 모습은 정말 단 하나뿐인가요?</span>`

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
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const orientationPermission = await DeviceOrientationEvent.requestPermission();
        if (orientationPermission === 'granted') {
          setPermissionGranted(true);
          setIsOrientationEnabled(true);
        }
      }

      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        const motionPermission = await DeviceMotionEvent.requestPermission();
        if (motionPermission === 'granted') {
          onMotionPermissionGranted(); // 부모 컴포넌트에 권한 허용 알림
        }
      }

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

    const { alpha } = event
    if (alpha !== null) {
      setCurrentAngles({ alpha })  // alpha 값만 저장
      
      const alphaDiff = Math.abs(alpha - targetAlpha)
      setMaxAngleDiff(alphaDiff)  // alpha 각도 차이만 사용
      
      // 블러 계산
      let blur
      if (alphaDiff <= tolerance) {
        blur = 0
      } else if (alphaDiff <= clearThreshold) {
        const normalizedDiff = (alphaDiff - tolerance) / (clearThreshold - tolerance)
        blur = 3 * normalizedDiff
      } else {
        const normalizedDiff = (alphaDiff - clearThreshold) / (maxDistance - clearThreshold)
        blur = 3 + (maxBlur - 3) * normalizedDiff
      }
      
      setBlurAmount(blur)
    }
  }, [isOrientationEnabled, targetAlpha, tolerance, clearThreshold, maxDistance, maxBlur])

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

  return (
    <div 
      className="flex flex-col items-center min-h-screen bg-exhibition-bg overflow-hidden relative"
    >
      <div className="w-full pt-[10px]">
        <RotatedText text={originalText} title={title} blurAmount={getBlurAmount()} />
      </div>
    </div>
  )
}

export default Page1;