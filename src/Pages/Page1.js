import React, { useState, useEffect, useCallback } from 'react'
import RotatedText from '../components/RotatedText'
import AudioController from '../components/AudioController'

const Page1 = ({ onMotionPermissionGranted }) => {
    const [currentAlpha, setCurrentAlpha] = useState(0);
    const [blurAmount, setBlurAmount] = useState(10);
    const [showAngles, setShowAngles] = useState(false);
    const [outOfRangeTimer, setOutOfRangeTimer] = useState(null);
    const [hideTimer, setHideTimer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showHeader, setShowHeader] = useState(true);
    const [showAudioButton, setShowAudioButton] = useState(true);
    const [debugInfo, setDebugInfo] = useState('')
    const [maxAngleDiff, setMaxAngleDiff] = useState(0)
    const [isIOS, setIsIOS] = useState(false)
    const [showPermissionModal, setShowPermissionModal] = useState(false)
    const [isOrientationEnabled, setIsOrientationEnabled] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)

    // 설정값 단순화
    const targetAlpha = 45;
    const tolerance = 25;
    const maxBlur = 8;

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
  
  
    // iOS 권한 요청 처리
    const handlePermissionRequest = async () => {
      try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          const orientationPermission = await DeviceOrientationEvent.requestPermission();
          if (orientationPermission === 'granted') {
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
  
    // Home2.js 스타일로 단순화된 handleOrientation
    const handleOrientation = useCallback((event) => {
        if (event.alpha !== null) {
            setCurrentAlpha(event.alpha);
            
            // 단순하게 각도 차이 계산
            let angleDiff = Math.abs(event.alpha - targetAlpha);
            
            // 블러 계산도 단순화
            let blur = 0;
            if (angleDiff > tolerance) {
                blur = Math.min(maxBlur, (angleDiff / 60) * maxBlur);
                
                // 각도 표시 타이머
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
                if (showAngles) {
                    const timer = setTimeout(() => {
                        setShowAngles(false);
                    }, 3000);
                    setHideTimer(timer);
                }
            }
            
            setBlurAmount(blur);
        }
    }, [targetAlpha, tolerance, maxBlur, outOfRangeTimer, showAngles]);

    // 이벤트 리스너 설정 단순화
    useEffect(() => {
        window.addEventListener('deviceorientation', handleOrientation);
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [handleOrientation]);
  
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
      return Math.min(8, (maxAngleDiff / 60) * 8)
    }
  
    return (
        <div className="flex flex-col items-center min-h-screen bg-exhibition-bg overflow-hidden relative">
            {showAngles && (
                <div className="fixed top-4 right-4 z-50">
                    <p className="text-2xl text-right">
                        {Math.round(currentAlpha)}° <br/>
                        45°
                    </p>
                </div>
            )}
            
            <div className="w-full pt-[10px]">
                <RotatedText 
                    text={currentPage === 1 ? originalText : originalText2}
                    title={showHeader ? title : ""} 
                    artist={showHeader ? artist : ""}
                    caption={showHeader ? caption : ""}
                    blurAmount={blurAmount}
                    onNextClick={() => setCurrentPage(2)}
                    onPrevClick={() => setCurrentPage(1)}
                />
            </div>
            
            <AudioController
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                showAudioButton={showAudioButton}
                setShowAudioButton={setShowAudioButton}
                setDebugInfo={setDebugInfo}
                originalText={originalText}
                maxAngleDiff={maxAngleDiff} 
                tolerance={tolerance}
                maxDistance={60}
            />
        </div>
    );
}

export default Page1; 