import React, { useState, useEffect, useCallback } from 'react'
import RotatedText from '../components/RotatedText'

const Page2 = ({ onMotionPermissionGranted }) => {
    const [blurAmount, setBlurAmount] = useState(10)
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [showPermissionModal, setShowPermissionModal] = useState(false)
    const [isOrientationEnabled, setIsOrientationEnabled] = useState(true)
    const [currentAngles, setCurrentAngles] = useState({ alpha: 0 })
    const [maxAngleDiff, setMaxAngleDiff] = useState(0)
    const [currentPage, setCurrentPage] = useState(1);
    const [showHeader, setShowHeader] = useState(true);
    const [showAngles, setShowAngles] = useState(false);
    const [outOfRangeTimer, setOutOfRangeTimer] = useState(null);
    const [hideTimer, setHideTimer] = useState(null);
  
    // 목표 각도 및 허용 범위 설정
    const targetAlpha = 75  // 알파 값만 사용
    const tolerance = 25    // 완전히 선명해지는 범위
    const clearThreshold = 35  // 읽을 수 있는 범위
    const maxBlur = 30
    const maxDistance = 45 // 최대 거리 (각도 차이)
  
    const title = "보이지 않는 조각들: 공기조각"
    const artist = "송예슬"
    const caption = "2025, 설치, 초음파 파장, 커스텀 소프트웨어,<br>가변 크기. 국립아시아문화전당 재제작 지원, 작가 제공."
    
    const originalText = `이 작품은 초음파 파장을 이용하여 공기를 조각하는 작품입니다. <span class="font-serif italic">우리가 볼 수 없는 것들은 정말 존재하지 않는 걸까요? 보이지 않는다고 해서 없는 것일까요?</span> 초음파는 우리 눈에는 보이지 않지만, 분명히 존재하며 공기를 통해 전달됩니다.<br>[다음]`
  
    const originalText2 = `[이전]<br>이 작품은 우리가 당연하게 여기는 '보는 것'에 대한 고정관념을 깨뜨립니다. <span class="font-serif italic">우리는 얼마나 많은 것들을 보지 못한 채 지나쳐 왔을까요? 당신의 주변에는 어떤 보이지 않는 것들이 존재하고 있나요?</span> 때로는 눈을 감고 다른 감각으로 세상을 느껴보는 것도 좋을 것 같습니다.`

    // 각도에 따른 텍스트 블러 효과 함수 추가
    const getBlurAmount = () => {
      if (maxAngleDiff <= tolerance) {
        return 0 // 목표 각도에 도달하면 블러 없음
      }
      // 각도 차이가 클수록 블러가 강해짐
      return Math.min(8, (maxAngleDiff / maxDistance) * 8)
    }

    const handleNextClick = () => {
      setCurrentPage(2);
      setShowHeader(false);
    };

    const handlePrevClick = () => {
      setCurrentPage(1);
      setShowHeader(true);
    };

    const displayText = currentPage === 1 ? originalText : originalText2;

    // 방향 감지 이벤트 핸들러 추가
    const handleOrientation = useCallback((event) => {
        if (!isOrientationEnabled) return;

        const { alpha } = event;
        if (alpha !== null) {
            setCurrentAngles({ alpha });
            
            let angleDiff;
            if (targetAlpha === 0) {
                const diff1 = Math.abs(alpha - 0);
                const diff2 = Math.abs(alpha - 360);
                angleDiff = Math.min(diff1, diff2);
            } else {
                angleDiff = Math.abs(alpha - targetAlpha);
            }
            
            setMaxAngleDiff(angleDiff);
            
            if (angleDiff > tolerance) {
                if (hideTimer) {
                    clearTimeout(hideTimer);
                    setHideTimer(null);
                }
                
                if (!outOfRangeTimer) {
                    const timer = setTimeout(() => {
                        setShowAngles(true);
                    }, 5000);
                    setOutOfRangeTimer(timer);
                }
            } else {
                if (outOfRangeTimer) {
                    clearTimeout(outOfRangeTimer);
                    setOutOfRangeTimer(null);
                }
                
                if (showAngles && !hideTimer) {
                    const timer = setTimeout(() => {
                        setShowAngles(false);
                    }, 3000);
                    setHideTimer(timer);
                }
            }
        }
    }, [isOrientationEnabled, targetAlpha, tolerance, outOfRangeTimer, hideTimer, showAngles]);

    // 방향 감지 이벤트 리스너 등록
    useEffect(() => {
        let orientationHandler = null;
        
        if (window.DeviceOrientationEvent && isOrientationEnabled) {
            orientationHandler = handleOrientation;
            window.addEventListener('deviceorientation', orientationHandler);
        }

        return () => {
            if (orientationHandler) {
                window.removeEventListener('deviceorientation', orientationHandler);
            }
        };
    }, [isOrientationEnabled, handleOrientation]);

    return (
        <div className="flex flex-col items-center min-h-screen bg-exhibition-bg overflow-hidden relative">
            {/* 각도 표시 */}
            {showAngles && (
                <div className="fixed top-4 right-4 z-50">
                    <p className="text-2xl">
                        {Math.round(currentAngles.alpha)}° <br/>
                        45°
                    </p>
                </div>
            )}

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
        </div>
    );
}

export default Page2; 