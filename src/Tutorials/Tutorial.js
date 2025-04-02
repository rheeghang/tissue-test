import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useBlurEffect } from '../hooks/useBlurEffect';
import { useGuide } from '../contexts/GuideContext';

const Tutorial = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [alphaInit, setAlphaInit] = useState(null);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [currentBeta, setCurrentBeta] = useState(0);
  const [currentGamma, setCurrentGamma] = useState(0);
  const [outOfRangeStartTime, setOutOfRangeStartTime] = useState(null);
  const { showGuideMessage } = useGuide();

  // 각 단계별 설정
  const tutorialConfig = {
    1: {
      angle: 30,
      bgColor: 'bg-gray-200',
      textColor: 'text-gray-800',
      content: "국립아시아문화전당은 티슈오피스와 함께 다양한 관점으로 전시를 감상하는 도슨팅 모바일 웹을 개발했습니다.",
      style: {
        top: '30vh',
        width: '320px'
      },
      containerClassName: "fixed left-1/2 -translate-x-1/2 z-0"
    },
    2: {
      angle: 80,
      bgColor: 'bg-gray-200',
      textColor: 'text-gray-800',
      content: "큐레이터의 해설을 명쾌하고 매끄럽고 깔끔하고 편리하게 전달하는 보편적인 도슨트 기능에서 벗어나 조금은 번거롭고 비생산적이며 낯설지만,",
      style: {
        top: '50vh',
        left: '20%',
        width: '320px'
      },
      containerClassName: "fixed left-1/2 -translate-x-1/2 z-0"
    },
    3: {
      angle: 120,
      bgColor: 'bg-key-color',
      textColor: 'text-white',
      content: "'각도'를 바꾸고 '관점'을 틀어 각자만의 방식으로 작품을 이해하는 시간을 가지고자 합니다.",
      style: {
        top: '70vh',
        left: '-10%',
        width: '320px'
      },
      containerClassName: "fixed left-1/2 -translate-x-1/2 z-0"
    }
  };

  const currentConfig = tutorialConfig[step];
  const { blurAmount, currentAlpha: deviceAlpha } = useBlurEffect(currentConfig.angle, { tolerance: 17 });

  // 가이드 메시지 표시 로직
  useEffect(() => {
    const now = Date.now();
    const isOutOfRange = Math.abs(deviceAlpha - currentConfig.angle) > 17;
    
    if (isOutOfRange) {
      if (!outOfRangeStartTime) {
        setOutOfRangeStartTime(now);
      } else if (now - outOfRangeStartTime >= 4000) {
        showGuideMessage();
      }
    } else {
      setOutOfRangeStartTime(null);
    }
  }, [deviceAlpha, currentConfig.angle, outOfRangeStartTime, showGuideMessage]);

  useEffect(() => {
    const handleOrientation = (event) => {
      const alpha = event.alpha ?? 0;
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;

      setCurrentAlpha(alpha);
      setCurrentBeta(beta);
      setCurrentGamma(gamma);

      if (alphaInit === null) {
        setAlphaInit(alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [alphaInit]);

  // shake 이벤트 관련 useEffect 수정
  useEffect(() => {
    const originalShakeEvent = window.onshake;  // 기존 shake 이벤트 핸들러 저장

    // shake 이벤트 핸들러 재정의
    window.onshake = (e) => {
      if (step !== 3) {
        // 3단계가 아니면 shake 이벤트 무시
        e.preventDefault();
        return;
      }
      // 3단계면 기존 shake 이벤트 핸들러 실행
      originalShakeEvent?.(e);
    };

    // cleanup
    return () => {
      window.onshake = originalShakeEvent;  // 원래 이벤트 핸들러 복구
    };
  }, [step]);

  // 다음 단계로 이동
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/1');
    }
  };

  // 이전 단계로 이동
  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed top-2 left-0 right-0 space-y-1 text-center z-10">
        {/* {step === 2 && (
          <>
            <p className="text-xl font-bold text-white">init:{Math.round(alphaInit)}°</p>
            <p className="text-xl font-bold text-white">target:{Math.round(currentConfig.angle)}°</p>
            <p className="text-xl font-bold text-white">current:{Math.round(currentAlpha)}°</p>
            <p className="text-sm text-gray-300">beta:{Math.round(currentBeta)}° / gamma:{Math.round(currentGamma)}°</p>
          </>
        )} */}
        {(step === 1 || step === 2 || step === 3) && (
          <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
        )}
      </div>

      {/* 회전 텍스트 박스 */}
      <div 
        className={currentConfig.containerClassName}
        style={{
          ...currentConfig.style,
          transform: `rotate(${currentConfig.angle}deg) translateX(-50%)`,
          transformOrigin: 'center center',
          filter: `blur(${blurAmount}px)`,
          transition: 'filter 0.3s ease, transform 0.3s ease, top 0.3s ease',
        }}
      >
        <div
          className={`p-4 ${currentConfig.bgColor} shadow-lg relative`}
        >
          <p className={`text-lg leading-relaxed ${currentConfig.textColor} break-keep mb-8`}>
            {currentConfig.content}
          </p>
          
          <div className="mt-14">
            {step > 1 && (
              <div 
                className="absolute bottom-2 left-2 cursor-pointer"
                onClick={handlePrev}
              >
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className={`rotate-180 ${step === 3 ? 'stroke-gray-200' : 'stroke-[#FF5218]'}`}
                >
                  <path 
                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            
            {step < 3 && (
              <div 
                className="absolute bottom-2 right-2 cursor-pointer"
                onClick={handleNext}
              >
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path 
                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                    stroke="#FF5218" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {step === 3 && (
        <div 
          className="fixed top-[20vh] rotate-[120deg] right-10 left-10 items-center justify-center p-1 bg-white/80 text-black text-center text-sm font-medium"
          style={{
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease',
          }}
        >
          흔들면 메뉴가 나옵니다.
        </div>
      )}
    </div>
  );
};

export default Tutorial; 