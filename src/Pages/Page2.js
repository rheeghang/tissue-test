import React, { useState, useEffect, useCallback } from 'react'
import RotatedText from '../components/RotatedText'

const Page2 = ({ onMotionPermissionGranted }) => {
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
  const [showAngleOverlay, setShowAngleOverlay] = useState(false); // 상태 추가
  const [outOfRangeStartTime, setOutOfRangeStartTime] = useState(null); // 추가된 상태

  // 목표 각도 및 허용 범위 설정
  const targetAlpha = 330  // 알파 값만 사용
  const tolerance = 18    // 완전히 선명해지는 범위
  const clearThreshold = 35  // 읽을 수 있는 범위
  const maxBlur = 30
  const maxDistance = 45 // 최대 거리 (각도 차이)

  const title = "코 없는 코끼리 no.2"
  const artist = "엄정순"
  const caption = "2024~2025, 설치, 고밀도 스티로폼,재생 플라스틱 플레이크,<br />금속, 230(h)X150(W)280(D)cm."
  
  // caption을 JSX로 변환
  const formattedCaption = "2024~2025, 설치, 고밀도 스티로폼,재생 플라스틱 플레이크,<br />금속, 230(h)X150(W)280(D)cm."

  // newlines 배열 대신 직접 JSX 사용
  const originalText = `이 설치작품은 엄정순 작가의 코 없는 코끼리 no.2입니다. 높이 2ｍ 30㎝, 너비 1m 50㎝, 길이 2ｍ 80㎝에 이르는 대형 작품은 철골 구조 위에 고밀도 스티로폼과 재생 플라스틱 플레이크를 덧붙여 제작되었고, 그 위를 투박한 질감의 도장으로 마감하여 표면은 매끄럽지 않습니다. 둥글고 묵직한 몸통은 실제 코끼리처럼 크고, 두툼한 다리로 땅을 단단히 딛고 있습니다.
\n\n
하지만 그 중심에서 중요한 것이 사라졌습니다. 코입니다. 작가는 이 코끼리를 '이방인', '타자', 그리고 '보이지 않는 것'의 상징으로 제시합니다. 우리는 코가 없는 이 형상을 보며 익숙한 이미지와 다름을 느끼고, 자연스럽게 질문하게 됩니다. 코가 없으면 코끼리가 아닐까요? 보이지 않으면 존재하지 않는 걸까요? 당신이 알고 있던 코끼리의 모습은 정말 단 하나뿐인가요?`;
  const originalText2 = "";
  
  // iOS 디바이스 체크
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(isIOSDevice)
    if (isIOSDevice) {
      setShowPermissionModal(true)
    }
  }, [])

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
        
        // 각도 차이 계산 단순화
        const alphaDiff = Math.abs(event.alpha - targetAlpha);
        setMaxAngleDiff(alphaDiff);
        
        // 블러 계산
        let blur;
        if (alphaDiff <= tolerance) {
            blur = 0;
        } else {
            if (alphaDiff <= clearThreshold) {
                const normalizedDiff = (alphaDiff - tolerance) / (clearThreshold - tolerance);
                blur = 3 * normalizedDiff;
            } else {
                const normalizedDiff = (alphaDiff - clearThreshold) / (maxDistance - clearThreshold);
                blur = 3 + (maxBlur - 3) * normalizedDiff;
            }
        }
        setBlurAmount(blur);
    }
  }, [targetAlpha, tolerance, clearThreshold, maxDistance, maxBlur]);

  // 이벤트 리스너 등록 추가 (Page1.js와 동일)
  useEffect(() => {
    if (isOrientationEnabled) {  // orientation이 활성화된 경우에만 이벤트 리스너 등록
        window.addEventListener('deviceorientation', handleOrientation);
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }
  }, [handleOrientation, isOrientationEnabled]);

  // 사용자 알파값과 targetAlpha 표시 조건 구현
  useEffect(() => {
    const alphaDiff = Math.abs(currentAlpha - targetAlpha);
    const now = Date.now();

    if (alphaDiff > tolerance) {
      if (!outOfRangeStartTime) {
        setOutOfRangeStartTime(now);
      } else if (now - outOfRangeStartTime >= 4000) {
        setShowAngleOverlay(true);
      }
    } else {
      setOutOfRangeStartTime(null);
      setTimeout(() => {
        setShowAngleOverlay(false);
      }, 3000);
    }
  }, [currentAlpha, targetAlpha, tolerance, outOfRangeStartTime]);

  // 각도에 따른 텍스트 블러 효과
  const getBlurAmount = () => {
    if (maxAngleDiff <= tolerance) {
      return 0 // 목표 각도에 도달하면 블러 없음
    }
    // 각도 차이가 클수록 블러가 강해짐
    return Math.min(8, (maxAngleDiff / maxDistance) * 8)
  }

  // 페이지 전환 핸들러 추가
  const handleNextClick = () => {
    setCurrentPage(2);
    setShowHeader(false);
  };

  const handlePrevClick = () => {
    setCurrentPage(1);
    setShowHeader(true);
  };

  // 각도가 -30도인 경우의 스타일
  const page2Styles = {
    artistMargin: '10px',     // 작가명 여백 증가
    lineSpacing: '10px',      // 행간 증가
    textTop: '10px',          // 텍스트 상단 여백 증가
    containerPadding: '10vh', // 컨테이너 패딩 증가
    titleBlockMargin: '10px',  // 제목 블록 여백 증가
    paddingTop: '0vh'
  }

  return (
    // overflow-hidden 제거하고 height 설정
    <div className="flex flex-col items-center h-full w-full bg-exhibition-bg">
      {showAngleOverlay && (
        <div className="fixed top-3 right-3 text-lg">
          <p>{Math.round(currentAlpha)}°</p>
          <p>{targetAlpha}°</p>
        </div>
      )}

      <div className="w-full pt-[10px]">
        <RotatedText 
          text={currentPage === 1 ? originalText : originalText2}
          title={showHeader ? title : ""} 
          artist={showHeader ? artist : ""}
          caption={showHeader ? formattedCaption : ""}
          blurAmount={getBlurAmount()}
          onNextClick={handleNextClick}
          onPrevClick={handlePrevClick}
          rotationAngle={-30}
        />
      </div>
    </div>
  )
}

export default Page2;