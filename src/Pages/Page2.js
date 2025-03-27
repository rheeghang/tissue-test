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
  
    const title = "코 없는 코끼리 no.2"
    const artist = "엄정순"
    const caption = "2024~2025, 설치, 고밀도 스티로폼,재생 플라스틱 플레이크, <br>금속, 230(h)X150(W)280(D)cm. 국립아시아문화전당 제작 지원, 작가 제공."
    
    const originalText = `이 설치작품은 엄정순 작가의 코 없는 코끼리 no.2입니다. 높이 2ｍ 30㎝, 너비 1m 50㎝, 길이 2ｍ 80㎝에 이르는 대형 작품은 철골 구조 위에 고밀도 스티로폼과 재생 플라스틱 플레이크를 덧붙여 제작되었고, 그 위를 투박한 질감의 도장으로 마감하여 표면은 매끄럽지 않습니다. 둥글고 묵직한 몸통은 실제 코끼리처럼 크고, 두툼한 다리로 땅을 단단히 딛고 있습니다. <br>[다음]`
  
    const originalText2 = `하지만 그 중심에서 중요한 것이 사라졌습니다. 코입니다. 작가는 이 코끼리를 ‘이방인’, ‘타자’, 그리고 ‘보이지 않는 것’의 상징으로 제시합니다. 우리는 코가 없는 이 형상을 보며 익숙한 이미지와 다름을 느끼고, 자연스럽게 질문하게 됩니다. <span class="font-serif italic">코가 없으면 코끼리가 아닐까요? 보이지 않으면 존재하지 않는 걸까요? 당신이 알고 있던 코끼리의 모습은 정말 단 하나뿐인가요?</span>`

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