import React, { useState, useEffect } from 'react';
import { useBlur } from '../contexts/BlurContext';
import { useGuide } from '../contexts/GuideContext';
import { useLanguage } from '../contexts/LanguageContext';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import pageConfig from '../config/pages.json';
import { useMode } from '../contexts/ModeContext';
import MenuIcon from './MenuIcon';
import Menu from './Menu';

// Modal 컴포넌트 추가
const Modal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative z-50 w-80 rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-xl font-bold text-gray-900">센서 권한 요청</h3>
        <p className="mb-6 text-gray-600">
          기기 방향 감지 센서 권한이 필요합니다.
        </p>
        <button
          onClick={onConfirm}
          className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
        >
          허용
        </button>
      </div>
    </div>
  );
};

const ArtPage = () => {
  const [alpha, setAlpha] = useState(0);
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [boxColor, setBoxColor] = useState("#FF5218");
  const { blurAmount, currentAlpha, setTargetAlpha } = useBlur();
  const { showGuideMessage } = useGuide();
  const [tutorialStep, setTutorialStep] = useState(0);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ko';
  });
  const [showStartButton, setShowStartButton] = useState(false);
  const [alphaInit, setAlphaInit] = useState(null);
  const [outOfRangeStartTime, setOutOfRangeStartTime] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const { isOrientationMode } = useMode();
  const [pageNumber, setPageNumber] = useState(0);

  // 권한 관련 상태 추가
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showModal, setShowModal] = useState(true);

  // 첫 페이지일 때는 Home1의 로직 사용
  const isHomePage = pageNumber === 0;
  
  useEffect(() => {
    if (!isHomePage && pageNumber > 0) {
      const config = pageConfig.pages[pageNumber];
      if (config) {
        setTargetAlpha(config.targetAlpha);
      }
    }
  }, [pageNumber, isHomePage]);

  // Home1의 디바이스 방향 감지 로직
  useEffect(() => {
    if (isHomePage) {
      const handleOrientation = (event) => {
        setAlpha(prevAlpha => {
          const newAlpha = event.alpha || 0;
          return prevAlpha + (newAlpha - prevAlpha) * 0.1;
        });
        setBeta(prevBeta => {
          const newBeta = event.beta || 0;
          return prevBeta + (newBeta - prevBeta) * 0.1;
        });
        setGamma(prevGamma => {
          const newGamma = event.gamma || 0;
          const nextGamma = prevGamma + (newGamma - prevGamma) * 0.1;

          // 감마값에 따른 색상 변경
          if ((Math.abs(nextGamma) >= 45 && Math.abs(nextGamma) <= 65) || 
              (Math.abs(nextGamma) >= -65 && Math.abs(nextGamma) <= -45)) {
            setBoxColor(getRandomColor());
          }

          return nextGamma;
        });
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [isHomePage]);

  // 랜덤 색상 생성 함수
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Tutorial 설정
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

  // 튜토리얼 모드일 때의 가이드 메시지
  useEffect(() => {
    if (tutorialStep > 0) {
      const currentConfig = tutorialConfig[tutorialStep];
      const now = Date.now();
      const isOutOfRange = Math.abs(currentAlpha - currentConfig.angle) > 17;
      
      if (isOutOfRange) {
        if (!outOfRangeStartTime) {
          setOutOfRangeStartTime(now);
        } else if (now - outOfRangeStartTime >= 4000) {
          showGuideMessage();
        }
      } else {
        setOutOfRangeStartTime(null);
      }
    }
  }, [currentAlpha, tutorialStep, outOfRangeStartTime]);

  // Home1 페이지에서 시작하기 버튼 클릭 시
  const handleStartClick = () => {
    console.log('Tutorial 시작'); // 디버깅용
    setTutorialStep(1);  // 튜토리얼 시작
  };

  // 튜토리얼 단계 이동
  const handleTutorialNext = () => {
    if (tutorialStep < 3) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setTutorialStep(0);
      setPageNumber(2);  // 첫 번째 작품 페이지로
    }
  };

  const handleTutorialPrev = () => {
    if (tutorialStep > 1) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  // 언어 변경 핸들러
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // 언어 선택 컴포넌트
  const LanguageSelector = () => (
    <div className="fixed bottom-[15vh] left-0 right-0 flex justify-center">
      <div className="text-lg font-bold text-black">
        <span 
          className={`cursor-pointer ${language === 'ko' ? 'text-black' : 'text-gray-400'}`}
          onClick={() => handleLanguageChange('ko')}
        >
          Ko
        </span>
        <span className="mx-2">|</span>
        <span 
          className={`cursor-pointer ${language === 'en' ? 'text-black' : 'text-gray-400'}`}
          onClick={() => handleLanguageChange('en')}
        >
          En
        </span>
      </div>
    </div>
  );

  // 시작하기 버튼 표시 타이머
  useEffect(() => {
    if (isHomePage) {
      const timer = setTimeout(() => {
        setShowStartButton(true);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isHomePage]);

  // 언어 데이터 선택
  const data = language === 'ko' ? koData : enData;
  
  // 페이지 전환 처리 수정
  const handlePageChange = (newPage) => {
    setShowMenu(false);  // 메뉴 닫기
    
    if (newPage === 'home') {
      // Home으로 돌아가기
      setTutorialStep(0);
      setPageNumber(0);  // 홈 페이지는 0번으로 설정
    } else if (newPage === 'about') {
      // About 페이지 처리
    } else {
      // 작품 페이지로 이동
      setTutorialStep(0);
      setPageNumber(Number(newPage));
    }
  };

  // 메뉴 컴포넌트에 전달할 props
  const menuProps = {
    isOpen: showMenu,
    onClose: () => setShowMenu(false),
    onPageSelect: handlePageChange
  };

  // shake 이벤트 처리 수정 (pageNumber > 1일 때만 적용)
  useEffect(() => {
    if (pageNumber > 1) {
      const handleShake = () => {
        toggleMenu();
      };

      window.onshake = handleShake;
      return () => {
        window.onshake = null;
      };
    }
  }, [pageNumber]);

  // blur 효과 관리
  useEffect(() => {
    if (!isHomePage && !tutorialStep && isOrientationMode && pageNumber > 0) {
      const config = pageConfig.pages[pageNumber];
      if (config) {
        setTargetAlpha(config.targetAlpha);
      }
    }
  }, [pageNumber, isOrientationMode, isHomePage, tutorialStep]);

  // 가이드 메시지 관리
  useEffect(() => {
    if (!isHomePage && !tutorialStep && isOrientationMode && pageNumber > 0) {
      const now = Date.now();
      const config = pageConfig.pages[pageNumber];
      if (!config) return;

      const isOutOfRange = Math.abs(currentAlpha - config.targetAlpha) > 17;
      
      if (isOutOfRange) {
        if (!outOfRangeStartTime) {
          setOutOfRangeStartTime(now);
        } else if (now - outOfRangeStartTime >= 4000) {
          showGuideMessage();
        }
      } else {
        setOutOfRangeStartTime(null);
      }
    }
  }, [currentAlpha, pageNumber, isOrientationMode, outOfRangeStartTime]);

  // toggleMenu 함수 추가
  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  // 권한 요청 함수
  const requestPermission = () => {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === "granted") {
            console.log("Permission granted!");
            setPermissionGranted(true);
            setShowModal(false);
          }
        })
        .catch(console.error);
    } else {
      setPermissionGranted(true);
      setShowModal(false);
    }
  };

  // 작품 페이지 렌더링 함수 수정
  const renderArtworkPage = () => {
    if (pageNumber === 0) return null;

    const config = pageConfig.pages[pageNumber];
    if (!config) return null;

    const pageContent = data[`page${pageNumber}`];
    if (!pageContent) return null;

    const { title, artist, caption, body } = pageContent;
    
    return (
      <div className="min-h-screen bg-base-color fixed w-full">
        {/* 메뉴 아이콘 */}
        <div className="fixed top-2 right-2 z-20">
          <button onClick={() => setShowMenu(true)} className="p-2">
            <MenuIcon />
          </button>
        </div>

        {/* 각도 표시
        <div className="fixed top-2 left-0 right-0 text-center z-10">
          <p className="text-xl font-bold text-white">
            {Math.round(currentAlpha)}°
          </p>
        </div> */}

        <div className="outer-container relative w-[120%] h-[150vh] flex items-center justify-center"
          style={{
            transform: `rotate(${config.targetAlpha}deg)`,
            top: pageNumber === 3 ? '0' : '-30vh',
            filter: isOrientationMode ? `blur(${blurAmount}px)` : 'none',
            transition: 'filter 0.5s ease, transform 0.5s ease'
          }}
        >
          <div 
            className="container h-[150vh] overflow-y-auto overflow-x-hidden flex flex-col items-center"
            style={{
              transform: 'translateZ(0)',
              maxHeight: '140vh',
              overflowY: 'auto',
              WebkitScrollbar: 'none',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <div 
              className={`container p-8 w-[80%] ${config.className} text-stroke-white-thin shadow-lg mt-[50vh] mb-[100vh]`}
              style={{
                marginTop: pageNumber === 1 ? '63vh' :
                          pageNumber === 3 ? '55vh' :
                          pageNumber === 6 ? '45vh' : '65vh'
              }}
            >
              <div className="text-center mb-8">
                <h1 className="text-xl font-bold mb-4">{title}</h1>
                <p className="text-base mb-2">{artist}</p>
                <p className="text-xs" dangerouslySetInnerHTML={{ __html: caption }} />
              </div>
              
              <div 
                className="text-base leading-relaxed break-keep"
                dangerouslySetInnerHTML={{ __html: body }}
              />  
            </div>
          </div>
        </div>

        {/* 가이드 메시지 */}
        <div className="fixed top-3 right-10 left-10 items-center justify-center p-1 bg-white/50 text-black text-center text-sm">
          {language === 'ko' 
            ? "다음 작품으로 이동하려면 흔들어주세요."
            : "Shake it to move to the next part"
          }
        </div>

        {/* 메뉴 오버레이 */}
        {showMenu && <Menu {...menuProps} />}
      </div>
    );
  };

  // 조건부 렌더링 수정
  if (pageNumber === 0 && tutorialStep === 0) {
    // 홈 페이지 렌더링
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="items-center min-h-screen space-y-2 text-center z-10 text-gray-800">
          <h1 className="text-sm leading-relaxed font-bold mb-4 font-medium">
            {data.home1.title}
          </h1>
          <div className="items-center space-y-2 text-center z-11 font-bold text-black">
            <p className="text-xl font-medium text-gray-800">Z(α): {Math.round(alpha)}°</p>
            <p className="text-xl font-medium text-gray-800">X(β): {Math.round(beta)}°</p>
            <p className="text-xl font-medium text-gray-800">Y(γ): {Math.round(gamma)}°</p>
          </div>
        </div>

        {/* 회전하는 박스 */}
        <div className="fixed inset-0 flex items-center justify-center z-0">
          <div
            style={{
              backgroundColor: boxColor,
              transition: "all 0.3s ease",
              transform: `rotate(${gamma}deg)`,
              width: '250px',
              height: '250px',
              borderRadius: (Math.abs(gamma) >= 45 && Math.abs(gamma) <= 65) || 
                           (Math.abs(gamma) >= -65 && Math.abs(gamma) <= -45) 
                           ? '125px' : '0px',
            }}
            className="shadow-lg"
          />
        </div>

        {/* 하단 영역 수정 */}
        <div className="fixed bottom-3 left-0 right-0 flex flex-col items-center space-y-3">
          {showStartButton && (
            <button 
              onClick={handleStartClick}
              className="w-48 bg-black px-6 py-4 text-xl font-bold text-white shadow-lg transition-opacity duration-[2000ms] hover:bg-gray-800"
            >
              {data.home1.startButton}
            </button>
          )}
          <LanguageSelector />
        </div>
      </div>
    );
  } else if (tutorialStep > 0) {
    const currentConfig = tutorialConfig[tutorialStep];
    return (
      <div className="relative min-h-screen overflow-hidden bg-base-color">
        <div className="fixed top-2 left-0 right-0 text-center z-10">
          <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
        </div>

        <div 
          className={currentConfig.containerClassName }
          style={{
            ...currentConfig.style,
            transform: `rotate(${currentConfig.angle}deg) translateX(-50%)`,
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease, transform 0.3s ease',
          }}
        >
          <div 
            className={`p-4 ${currentConfig.bgColor} shadow-2xl relative rounded-lg`}
          >
            <p className={`text-lg leading-relaxed ${currentConfig.textColor} break-keep mb-8`}>
              {currentConfig.content}
            </p>
            
            <div className="mt-14">
              
              {tutorialStep === 3 ? (
                <div 
                  className="absolute bottom-2 right-2 cursor-pointer"
                  onClick={toggleMenu}
                >
                  <MenuIcon />
                </div>
              ) : (
                <div 
                  className="absolute bottom-2 right-2 cursor-pointer"
                  onClick={handleTutorialNext}
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

        {tutorialStep === 3 && (
          <div 
            className="fixed top-[20vh] rotate-[120deg] right-10 left-10 items-center justify-center p-1 bg-white/80 text-black text-center text-sm font-medium"
            style={{
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 0.3s ease',
            }}
          >
            메뉴 아이콘을 클릭하세요
          </div>
        )}

        {/* 메뉴 오버레이 */}
        {showMenu && <Menu {...menuProps} />}
      </div>
    );
  } else {
    // 작품 페이지 렌더링
    return renderArtworkPage();
  }

  return null;
};

export default ArtPage;