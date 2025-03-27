import React, { useState, useEffect, useCallback } from 'react'
import RotatedText from '../components/RotatedText'

const Page1 = ({ onMotionPermissionGranted }) => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [isOrientationEnabled, setIsOrientationEnabled] = useState(true)
  const [currentAlpha, setCurrentAlpha] = useState(0)
  const [maxAngleDiff, setMaxAngleDiff] = useState(0)
  const [showAngles, setShowAngles] = useState(false);
  const [outOfRangeTimer, setOutOfRangeTimer] = useState(null);
  const [hideTimer, setHideTimer] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 목표 각도 및 허용 범위 설정
  const targetAlpha = 45  // 알파 값만 사용
  const tolerance = 25    // 완전히 선명해지는 범위
  const clearThreshold = 35  // 읽을 수 있는 범위
  const maxBlur = 30
  const maxDistance = 45 // 최대 거리 (각도 차이)

  const title = "보이지 않는 조각들: 공기조각"
    const artist = "송예슬"
    const caption = "2025, 설치, 초음파 파장, 커스텀 소프트웨어,<br>가변 크기. 국립아시아문화전당 재제작 지원, 작가 제공."
    const originalText = `로비 공간에 들어서면, 하나의 좌대가 놓여 있습니다. <span class="font-serif italic">당신은 무엇을 기대하고 계셨나요? 조각상이 보일 거로 생각하지 않으셨나요?</span> 하지만 이 좌대 위에는 아무것도 보이지 않습니다. 송예슬 작가의 <보이지 않는 조각들: 공기조각>은 눈에 보이지 않는 감각 조각이며 예술적 실험입니다.<br>[다음]`
  
    const originalText2 = `[이전]<br>참여자는 좌대 위에 손을 올릴 수 있습니다. 그러면 손끝을 따라 공기 흐름이 위로 퍼지며 만지는 사람에 따라 그 모양과 감각은 조금씩 달라집니다. 그것은 눈에 보이지 않지만, 손끝으로는 분명히 '존재하는' 조각입니다. <span class="font-serif italic">정말 '보는 것'만이 예술을 감상하는 방식의 전부인가요? 손끝으로 만나는 이 조각은 당신에게 어떤 생각을 불러일으키나요?</span>`

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
          onMotionPermissionGranted();
        }
      }

      setShowPermissionModal(false);
    } catch (error) {
      console.error('권한 요청 실패:', error);
    }
  };

  // 방향 감지 이벤트 핸들러
  const handleOrientation = useCallback((event) => {
    if (event.alpha !== null) {
        setCurrentAlpha(event.alpha);
        
        // targetAlpha ± 18도 범위 체크
        const upperBound = (targetAlpha + 18) % 360;
        const lowerBound = (targetAlpha - 18 + 360) % 360;
        const currentAngle = event.alpha;
        
        // 목표 각도 범위 안에 있는지 확인
        const isInRange = lowerBound <= upperBound 
            ? (currentAngle >= lowerBound && currentAngle <= upperBound)
            : (currentAngle >= lowerBound || currentAngle <= upperBound);

        if (isInRange) {
            // 목표 각도 범위 안에 있을 때
            setBlurAmount(0);  // 텍스트 선명하게
            if (showAngles) {
                if (hideTimer) {
                    clearTimeout(hideTimer);
                }
                if (outOfRangeTimer) {
                    clearTimeout(outOfRangeTimer);
                    setOutOfRangeTimer(null);
                }
                // 3초 후에 숨기기
                const timer = setTimeout(() => {
                    setShowAngles(false);
                }, 3000);
                setHideTimer(timer);
            }
        } else {
            // 목표 각도 범위 밖에 있을 때
            if (!outOfRangeTimer && !showAngles) {
                // 5초 후에 각도 표시
                const timer = setTimeout(() => {
                    setShowAngles(true);
                }, 5000);
                setOutOfRangeTimer(timer);
            }
            
            // 블러 계산 - 각도 차이에 따라 블러 강도 조절
            const alphaDiff = Math.min(
                Math.abs(currentAngle - targetAlpha),
                Math.abs(currentAngle - (targetAlpha + 360))
            );
            
            // 블러 값 계산 개선
            let blurValue;
            if (alphaDiff <= 25) {  // 가까운 범위
                blurValue = (alphaDiff / 25) * 10;
            } else if (alphaDiff <= 45) {  // 중간 범위
                blurValue = 10 + ((alphaDiff - 25) / 20) * 20;
            } else {  // 먼 범위
                blurValue = 30;
            }
            
            setBlurAmount(blurValue);
        }
    }
  }, [targetAlpha, showAngles, outOfRangeTimer, hideTimer]);

  // 이벤트 리스너 등록 단순화
  useEffect(() => {
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  // 각도에 따른 텍스트 블러 효과
  const getBlurAmount = () => {
    if (maxAngleDiff <= tolerance) {
      return 0 // 목표 각도에 도달하면 블러 없음
    }
    // 각도 차이가 클수록 블러가 강해짐
    return Math.min(8, (maxAngleDiff / maxDistance) * 8)
  }

  // 페이지 전환 핸들러 수정
  const handleNextClick = () => {
    setCurrentPage(2);
    setShowHeader(false);
  };

  const handlePrevClick = () => {
    setCurrentPage(1);
    setShowHeader(true);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-exhibition-bg overflow-hidden relative">
      {/* 현재 알파값 항상 표시 */}
      {/* <div className="fixed top-2 left-0 right-0 space-y-1 text-center z-10">
        <p className="text-xl font-medium text-gray-800">{Math.round(currentAlpha)}°</p>
      </div> */}

      {/* 목표각도와 현재각도 차이 표시 */}
      {showAngles && (
        <div className="fixed top-4 right-4 z-50">
          <p className="text-2xl">
            {Math.round(currentAlpha)}° <br/>
            {targetAlpha}°
          </p>
        </div>
      )}

      <div className="w-full pt-[10px]">
        <RotatedText 
          text={currentPage === 1 ? originalText : originalText2}
          title={showHeader ? title : ""} 
          artist={showHeader ? artist : ""}
          caption={showHeader ? caption : ""}
          blurAmount={getBlurAmount()}
          onNextClick={handleNextClick}
          onPrevClick={handlePrevClick}
        />
      </div>
    </div>
  )
}

export default Page1;