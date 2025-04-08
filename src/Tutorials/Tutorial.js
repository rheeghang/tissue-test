import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useBlur } from '../contexts/BlurContext';
import { useGuide } from '../contexts/GuideContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import pageConfig from '../config/pages.json';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import MenuIcon from '../components/MenuIcon';
import Menu from '../components/Menu';

const Tutorial = () => {
  const { step: stepParam } = useParams();
  const navigate = useNavigate();
  
  // tutorialStep 초기값 설정
  const [tutorialStep, setTutorialStep] = useState(() => {
    const step = Number(stepParam);
    return isNaN(step) || step < 1 || step > 3 ? 1 : step;
  });

  const [alphaInit, setAlphaInit] = useState(null);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [currentBeta, setCurrentBeta] = useState(0);
  const [currentGamma, setCurrentGamma] = useState(0);
  const [outOfRangeStartTime, setOutOfRangeStartTime] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const { blurAmount, setTargetAngles, setIsUnlocked } = useBlur();
  const { showGuideMessage } = useGuide();
  const { language } = useLanguage();
  const data = language === 'ko' ? koData : enData;

  // 현재 설정 가져오기
  const currentConfig = pageConfig.tutorial[tutorialStep];

  // 모든 useEffect를 조건문 밖으로 이동
  useEffect(() => {
    const step = Number(stepParam);
    if (isNaN(step) || step < 1 || step > 3) {
      setTutorialStep(1);
      return;
    }
    setTutorialStep(step);
  }, [stepParam]);

  useEffect(() => {
    if (currentConfig) {
      setTargetAngles(currentConfig.targetAlpha);
    }
  }, [tutorialStep]);

  useEffect(() => {
    if (blurAmount === 0) {
      setIsUnlocked(true);
      console.log("✅ 언락 조건 충족! blur = 0");
    }
  }, [blurAmount, setIsUnlocked]);

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

  useEffect(() => {
    const originalShakeEvent = window.onshake;

    window.onshake = (e) => {
      if (tutorialStep !== 3) {
        e.preventDefault();
        return;
      }
      originalShakeEvent?.(e);
    };

    return () => {
      window.onshake = originalShakeEvent;
    };
  }, [tutorialStep]);

  const handleDoubleTap = (() => {
    let lastTap = 0;
    
    return (e) => {
      if (e.target.closest('.tutorial-button') || e.target.closest('.menu-icon')) {
        e.stopPropagation();
        return;
      }
      
      if (showMenu) {
        e.stopPropagation();
        return;
      }
      
      if (tutorialStep === 3) {
        e.stopPropagation();
        return;
      }
      
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 500 && tapLength > 0) {
        handleTutorialNext();
      }
      lastTap = currentTime;
    };
  })();

  const handleOpenMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setTimeout(() => {
      setShowMenu(true);
    }, 100);
  };

  const handleTutorialNext = () => {
    if (tutorialStep < 3) {
      const nextStep = tutorialStep + 1;
      setIsUnlocked(false);
      setTutorialStep(nextStep);
    } else {
      window.location.href = '/artwork/1';
    }
  };

  const handleTutorialPrev = () => {
    if (tutorialStep > 1) {
      const prevStep = tutorialStep - 1;
      setIsUnlocked(false);
      setTutorialStep(prevStep);
    }
  };

  const handlePageChange = (newPage) => {
    setShowMenu(false);
    setIsUnlocked(false);
    setOutOfRangeStartTime(null);
    
    if (newPage === 'home') {
      window.location.href = '/';
    } else if (newPage === 'about') {
      window.location.href = '/about';
    } else if (newPage === 'tutorial') {
      setTutorialStep(1);
    } else {
      window.location.href = `/artwork/${newPage}`;
    }
  };

  // 로딩 상태 처리
  if (!currentConfig) {
    return (
      <Layout>
        <div className="min-h-screen bg-base-color flex items-center justify-center">
          <p className="text-white">로딩중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div 
        className="relative min-h-screen overflow-hidden bg-base-color"
        onTouchStart={handleDoubleTap}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="fixed top-2 left-0 right-0 text-center z-10">
          {(tutorialStep === 1 || tutorialStep === 2 || tutorialStep === 3) && (
            <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
          )}
        </div>

        <div 
          className={currentConfig.containerClassName}
          style={{
            ...currentConfig.style,
            transform: `rotate(${currentConfig.rotationAngle}deg) translateX(-50%)`,
            transformOrigin: 'center center',
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease, transform 0.3s ease, top 0.3s ease',
          }}
        >
          <div className={`p-4 ${currentConfig.bgColor} shadow-lg relative`}>
            <p className={`text-lg leading-relaxed ${currentConfig.textColor} break-keep mb-8`}>
              {data.tutorial[`step${tutorialStep}`]}
            </p>
            
            <div className="mt-14">
              {tutorialStep === 3 ? (
                <button
                  className="absolute bottom-2 right-2 cursor-pointer menu-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(true);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setShowMenu(true);
                  }}
                  style={{ 
                    pointerEvents: 'auto',
                    background: 'none',
                    border: 'none',
                    padding: 0
                  }}
                  aria-label={language === 'ko' ? "메뉴 열기" : "Open menu"}
                >
                  <MenuIcon />
                </button>
              ) : (
                <div
                  className="absolute bottom-2 right-2 cursor-pointer tutorial-button"
                  onClick={handleTutorialNext}
                  onTouchStart={handleTutorialNext}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    padding: 0
                  }}
                  aria-label={language === 'ko' ? "다음 단계로" : "Next step"}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" 
                      stroke="#FF5218" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {showMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Menu
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
              onPageSelect={handlePageChange}
              pageNumber={tutorialStep}
              pageType="tutorial"
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tutorial; 