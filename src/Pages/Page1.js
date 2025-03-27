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
    const [currentPage, setCurrentPage] = useState(1);
    const [showHeader, setShowHeader] = useState(true);
    const [showAngles, setShowAngles] = useState(false);
    const [outOfRangeTimer, setOutOfRangeTimer] = useState(null);
    const [hideTimer, setHideTimer] = useState(null);
  
    // 목표 각도 및 허용 범위 설정
    const targetAlpha = 45  // 알파 값만 사용
    const tolerance = 25    // 완전히 선명해지는 범위
    const clearThreshold = 35  // 읽을 수 있는 범위
    const maxBlur = 30
    const maxDistance = 45 // 최대 거리 (각도 차이)
  
    const title = "보이지 않는 조각들: 공기조각"
    const artist = "송예슬"
    const caption = "2025, 설치, 초음파 파장, 커스텀 소프트웨어,<br>가변 크기. 국립아시아문화전당 재제작 지원, 작가 제공."
    const originalText = `로비 공간에 들어서면, 하나의 좌대가 놓여 있습니다. 당신은 무엇을 기대하고 계셨나요? 조각상이 보일 거로 생각하지 않으셨나요? 하지만 이 좌대 위에는 아무것도 보이지 않습니다. 송예슬 작가의 <보이지 않는 조각들: 공기조각>은 눈에 보이지 않는 감각 조각이며 예술적 실험입니다.<br>[다음]`
  
    const originalText2 = `[이전]<br>참여자는 좌대 위에 손을 올릴 수 있습니다. 그러면 손끝을 따라 공기 흐름이 위로 퍼지며 만지는 사람에 따라 그 모양과 감각은 조금씩 달라집니다. 그것은 눈에 보이지 않지만, 손끝으로는 분명히 '존재하는' 조각입니다. 정말 '보는 것'만이 예술을 감상하는 방식의 전부인가요? 손끝으로 만나는 이 조각은 당신에게 어떤 생각을 불러일으키나요?`

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
  
    // 15도 단위로 반올림하는 함수
    const roundTo15Degrees = (angle) => {
        return Math.round(angle / 15) * 15;
    };

    // 방향 감지 이벤트 핸들러 수정
    const handleOrientation = useCallback((event) => {
        if (!isOrientationEnabled) {
            setDebugInfo('Orientation disabled')
            return
        }

        const { alpha } = event
        if (alpha !== null) {
            setCurrentAngles({ alpha })
            
            const alphaDiff = Math.abs(alpha - targetAlpha)
            setMaxAngleDiff(alphaDiff)
            
            // tolerance 범위 밖에 있을 때
            if (alphaDiff > tolerance) {
                // 숨김 타이머가 있다면 제거
                if (hideTimer) {
                    clearTimeout(hideTimer);
                    setHideTimer(null);
                }
                
                // 표시 타이머 설정 (아직 없는 경우에만)
                if (!outOfRangeTimer) {
                    const timer = setTimeout(() => {
                        setShowAngles(true);
                    }, 5000); // 5초로 변경
                    setOutOfRangeTimer(timer);
                }
            } else {
                // tolerance 범위 안에 들어왔을 때
                // 표시 타이머가 있다면 제거
                if (outOfRangeTimer) {
                    clearTimeout(outOfRangeTimer);
                    setOutOfRangeTimer(null);
                }
                
                // 이미 각도가 표시되어 있는 경우에만 숨김 타이머 설정
                if (showAngles && !hideTimer) {
                    const timer = setTimeout(() => {
                        setShowAngles(false);
                    }, 3000); // 3초 후 숨김
                    setHideTimer(timer);
                }
            }
            
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
    }, [isOrientationEnabled, targetAlpha, tolerance, clearThreshold, maxDistance, maxBlur, outOfRangeTimer, hideTimer, showAngles])

    // cleanup effect 수정
    useEffect(() => {
        return () => {
            if (outOfRangeTimer) {
                clearTimeout(outOfRangeTimer);
            }
            if (hideTimer) {
                clearTimeout(hideTimer);
            }
        };
    }, [outOfRangeTimer, hideTimer]);
  
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
  
    const handleNextClick = () => {
      setCurrentPage(2);
      setShowHeader(false);
    };

    const handlePrevClick = () => {
      setCurrentPage(1);
      setShowHeader(true);
    };

    const displayText = currentPage === 1 ? originalText : originalText2;

    return (
      <div 
        className="flex flex-col items-center min-h-screen bg-exhibition-bg overflow-hidden relative"
      >
        <div className="w-full pt-[10px]">
          <RotatedText 
            text={displayText}
            title={showHeader ? title : ""} 
            artist={showHeader ? artist : ""}
            caption={showHeader ? caption : ""}
            blurAmount={getBlurAmount()}
            onNextClick={handleNextClick}
            onPrevClick={handlePrevClick}
          />
        </div>
        
  
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
  
        {/* 각도 표시 */}
        {showAngles && (
            <div className="fixed top-4 right-4 z-50">
                <p className="text-2xl">
                    {roundTo15Degrees(currentAngles.alpha)}° </p>
                    <p className="text-lg">45°</p>
                </p>
            </div>
        )}
  
      </div>
    )

}

export default Page1; 