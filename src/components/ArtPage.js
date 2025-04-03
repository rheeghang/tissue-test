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

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const modalMessage = isMobile
    ? "작품 감상을 위해 기기 방향 감지 센서 권한이 필요합니다."
    : "이 웹사이트는 모바일 기기에 최적화되어 있습니다. 모바일 기기로 접속해주세요.";

  const buttonText = isMobile ? "권한 허용하기" : "확인";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative z-[101] w-80 rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-xl font-bold text-gray-900">
          {isMobile ? "센서 권한 필요" : "알림"}
        </h3>
        <p className="mb-6 text-gray-600">
          {modalMessage}
        </p>
        <button
          onClick={onConfirm}
          className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const ArtPage = () => {
  // 상태 선언을 최상단으로 이동
  const [alpha, setAlpha] = useState(0);
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [boxColor, setBoxColor] = useState("#FF5218");  // key-color로 초기값 설정
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ko';
  });
  const [showStartButton, setShowStartButton] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [initialAlpha, setInitialAlpha] = useState(null);  // 페이지 로드시의 알파값 저장

  // context hooks
  const { blurAmount, currentAlpha, setTargetAlpha } = useBlur();
  const { showGuideMessage } = useGuide();
  const { isOrientationMode } = useMode();

  // 언어 데이터 선택을 상태 선언 후로 이동
  const data = language === 'ko' ? koData : enData;
  
  // iOS 체크 함수
  const isIOS = () => {
    return (
      ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
  };

  // 권한 요청 함수
  const requestPermission = async () => {
    try {
      if (isIOS() && typeof DeviceOrientationEvent !== 'undefined' && 
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
        }
      } else {
        setPermissionGranted(true);
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
    }
    setShowModal(false);
  };

  // 컴포넌트 마운트 시 권한 체크
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      if (isIOS()) {
        setShowModal(true);
      } else {
        setPermissionGranted(true);
        setShowModal(false);
      }
    } else {
      setShowModal(true);
    }
  }, []);

  // 권한 관련 상태
  const [showMenu, setShowMenu] = useState(false);
  const [alphaInit, setAlphaInit] = useState(null);
  const [outOfRangeStartTime, setOutOfRangeStartTime] = useState(null);

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

  // Home1의 디바이스 방향 감지 로직 수정
  useEffect(() => {
    if (isHomePage) {
      const handleOrientation = (event) => {
        setAlpha(prevAlpha => {
          const newAlpha = event.alpha || 0;
          return Math.round(newAlpha / 10) * 10;  // 10도 단위로 반올림
        });
        
        setBeta(prevBeta => {
          const newBeta = event.beta || 0;
          return Math.round(newBeta / 10) * 10;
        });
        
        setGamma(prevGamma => {
          const newGamma = event.gamma || 0;
          return Math.round(newGamma / 10) * 10;
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

  // Home1 페이지에서 시작하기 버튼 클릭 시
  const handleStartClick = () => {
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
    <div className="fixed bottom-[15vh] left-0 right-0 flex justify-center touch-manipulation">
      <div className="text-lg font-bold text-black">
        <button 
          className={`px-3 py-2 ${language === 'ko' ? 'text-black' : 'text-gray-400'}`}
          onClick={() => handleLanguageChange('ko')}
        >
          Ko
        </button>
        <span className="mx-2">|</span>
        <button 
          className={`px-3 py-2 ${language === 'en' ? 'text-black' : 'text-gray-400'}`}
          onClick={() => handleLanguageChange('en')}
        >
          En
        </button>
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

  // 페이지 전환 처리 수정
  const handlePageChange = (newPage) => {
    setShowMenu(false);  // 메뉴 닫기
    
    if (newPage === 'home') {
      console.log('홈으로 이동');
      setTutorialStep(0);
      setPageNumber(0);  // 홈 페이지는 0번으로 설정
    } else if (newPage === 'about') {
      console.log('어바웃 페이지로 이동');
      setTutorialStep(0);
      setPageNumber('about');  // about 페이지로 설정
    } else {
      console.log('작품 페이지로 이동:', newPage);
      setTutorialStep(0);
      setPageNumber(Number(newPage));
    }
  };

  // 메뉴 컴포넌트에 전달할 props
  const menuProps = {
    isOpen: showMenu,
    onClose: () => setShowMenu(false),
    onPageSelect: handlePageChange,
    pageNumber: pageNumber
  };


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
    if (!isHomePage && !tutorialStep && isOrientationMode && pageNumber > 0 && !showMenu) {
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
  }, [currentAlpha, pageNumber, isOrientationMode, outOfRangeStartTime, showMenu]);

  // toggleMenu 함수 추가
  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  // 페이지 번호가 변경될 때마다 스크롤 위치 초기화
  useEffect(() => {
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
      if (container) {
        container.scrollTop = 0;
      }
    });
  }, [pageNumber]);

  // 초기 알파값 저장을 위한 state 추가 (이미 있는 alphaInit 사용)
  useEffect(() => {
    const handleOrientation = (event) => {
      if (alphaInit === null) {
        setAlphaInit(event.alpha || 0);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [alphaInit]);

  // 터치 이벤트 관련 수정
  useEffect(() => {
    // viewport meta 태그 동적 추가/수정
    let metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement('meta');
      metaViewport.name = 'viewport';
      document.head.appendChild(metaViewport);
    }
    metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

    // 핀치 줌만 방지하고 일반 터치는 허용
    const handleGestureStart = (e) => {
      e.preventDefault();
    };
    
    document.addEventListener('gesturestart', handleGestureStart);

    return () => {
      document.removeEventListener('gesturestart', handleGestureStart);
    };
  }, []);

  // renderArtworkPage 함수 내의 rotation 계산 수정
  const renderArtworkPage = () => {
    if (pageNumber === 0) return null;

    const config = pageConfig.pages[pageNumber];
    if (!config) return null;

    const pageContent = data[`page${pageNumber}`];
    if (!pageContent) return null;

    // 디바이스 초기 알파값 기준으로 회전 각도 계산
    const rotationAngle = (alphaInit || 0) + config.targetAlpha;

    return (
      <div className="min-h-screen bg-base-color fixed w-full flex items-center justify-center">
        <div className="fixed top-2 left-0 right-0 text-center z-10">
          <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
        </div>
        {/* 메뉴 아이콘 */}
        <div className="fixed top-5 right-5 z-50">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="rounded-full bg-black p-2 shadow-lg flex items-center justify-center w-12 h-12 hover:bg-gray-800 transition-colors z-100"
            aria-label={showMenu ? "메뉴 닫기" : "메뉴 열기"}
          >
            {showMenu ? (
              <svg 
                width="30" 
                height="30" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
                <MenuIcon />
            )}
          </button>
        </div>

        {/* 각도 표시
        <div className="fixed top-2 left-0 right-0 text-center z-10">
          <p className="text-xl font-bold text-white">
            {Math.round(currentAlpha)}°
          </p>
        </div> */}

        <div className="outer-container absolute w-[120%] h-[150vh] flex items-center justify-center"
          style={{
            transform: `rotate(${rotationAngle}deg)`,
            top: pageNumber === 3 ? '40%' : '50%',
            marginTop: '-75vh',
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
              className={`container p-6 w-[320px] ${config.className} shadow-xl mt-[50vh] mb-[80vh]`}
              style={{
                marginTop: config.marginTop
              }}
            >
              <div className="text-center mb-8 break-keep">
                <h1 className="text-xl font-bold mb-4">{pageContent.title}</h1>
                <p className="text-base mb-2">{pageContent.artist}</p>
                <p className="text-xs" dangerouslySetInnerHTML={{ __html: pageContent.caption }} />
              </div>
              
              <div 
                className="text-base leading-relaxed break-keep"
                dangerouslySetInnerHTML={{ __html: pageContent.body }}
              />  
            </div>
          </div>
        </div>

        {/* 가이드 메시지
        <div className="fixed top-3 right-10 left-10 items-center justify-center p-1 bg-white/50 text-black text-center text-sm">
          {language === 'ko' 
            ? "다음 작품으로 이동하려면 흔들어주세요."
            : "Shake it to move to the next part"
          }
        </div> */}

        {/* 메뉴 오버레이 */}
        {showMenu && <Menu {...menuProps} />}
      </div>
    );
  };

  // 튜토리얼 관련 useEffect를 컴포넌트 최상위 레벨로 이동
  useEffect(() => {
    if (tutorialStep > 0) {
      const currentConfig = pageConfig.tutorial[tutorialStep];
      if (currentConfig && currentConfig.targetAlpha) {
        setTargetAlpha(currentConfig.targetAlpha);
      }
    }
  }, [tutorialStep, setTargetAlpha]);

  // 튜토리얼 렌더링 함수에서는 useEffect 제거
  const renderTutorial = () => {
    const currentConfig = pageConfig.tutorial[tutorialStep];
    
    return (
      <div className="relative min-h-screen overflow-hidden bg-base-color">
        <div className="fixed top-2 left-0 right-0 text-center z-10">
          <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
        </div>

        <div 
          className={currentConfig.containerClassName}
          style={{
            ...currentConfig.style,
            transform: `rotate(${currentConfig.angle}deg) translateX(-50%)`,
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease, transform 0.3s ease',
          }}
        >
          <div className={`p-4 ${currentConfig.bgColor} shadow-2xl relative`}>
            <p className={`text-lg leading-relaxed ${currentConfig.textColor} break-keep mb-8`}>
              {data.tutorial[`step${tutorialStep}`]}
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

        {/* 메뉴 오버레이 */}
        {showMenu && <Menu {...menuProps} />}
      </div>
    );
  };

  // renderAboutPage 함수 추가
  const renderAboutPage = () => {
    const { title, subtitle, body } = data.about;

    return (
      <div className="min-h-screen bg-black fixed w-full flex items-center justify-center">
        <div className="w-[100vw] h-[100vh] flex items-center justify-center">
          <div 
            className="container h-full overflow-y-auto overflow-x-hidden flex flex-col p-8 text-black leading-relaxed"
            style={{
              background: 'linear-gradient(to left, #FFEA7B, #FACFB9)'
            }}
          >
            <div className="text-center mb-8 w-full max-w-2xl">
              <p className="text-base mb-2">{subtitle}</p>
              <h1 className="text-2xl font-bold mb-4">{title}</h1>
            </div>
            
            <div 
              className="text-base leading-relaxed break-keep w-full max-w-2xl"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>

        {/* 메뉴 아이콘 */}
        <div className="fixed top-2 right-2 z-20">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="rounded-full bg-black p-2 shadow-lg flex items-center justify-center w-12 h-12 hover:bg-gray-800 transition-colors"
            aria-label={showMenu ? "메뉴 닫기" : "메뉴 열기"}
          >
            {showMenu ? (
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <MenuIcon />
            )}
          </button>
        </div>

        {/* 메뉴 오버레이 */}
        {showMenu && <Menu {...menuProps} />}
      </div>
    );
  };

  // renderHomePage 함수 추가
  const renderHomePage = () => {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="items-center min-h-screen space-y-2 text-center z-10 text-gray-800">
          <h1 className="text-sm leading-relaxed font-bold mb-4 font-medium whitespace-pre-line">
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
              backgroundColor: "#FF5218",
              transition: "all 0.5s ease",
              transform: `rotate(${gamma}deg)`,
              width: '250px',
              height: '250px',
              borderRadius: (Math.abs(gamma) >= 40 && Math.abs(gamma) <= 70) || 
                           (Math.abs(gamma) >= 290 && Math.abs(gamma) <= 320) 
                           ? '125px' : '0px',
            }}
            className="shadow-lg"
          />
        </div>

        {/* 하단 영역 */}
        <div className="fixed bottom-3 left-0 right-0 flex flex-col items-center space-y-3 touch-manipulation">
          {showStartButton && (
            <button 
              onClick={handleStartClick}
              className="w-48 bg-black px-6 py-4 text-xl font-bold text-white shadow-lg transition-opacity duration-[2000ms]"
              style={{ touchAction: 'manipulation' }}
            >
              {data.home1.startButton}
            </button>
          )}
          <LanguageSelector />
        </div>
      </div>
    );
  };

  // 메인 렌더링 부분 수정
  return (
    <>
      <Modal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={requestPermission}
      />

      {pageNumber === 'about' ? (
        renderAboutPage()
      ) : pageNumber === 0 && tutorialStep === 0 ? (
        renderHomePage()
      ) : tutorialStep > 0 ? (
        renderTutorial()
      ) : (
        renderArtworkPage()
      )}
    </>
  );
};

export default ArtPage;
