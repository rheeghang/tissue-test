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
import ScreenReaderText from './ScreenReaderText';
import LiveAnnouncer from './LiveAnnouncer';

// Modal 컴포넌트 추가
const Modal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const modalMessage = "작품 감상을 위해 기기의 방향 감지 센서 사용이 필요합니다 ";
  const buttonText = "허용 후 계속하기";

  if (!isMobile) return null;

  let isProcessing = false;

  const handlePermissionRequest = async (e) => {
    if (isProcessing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isProcessing = true;

    try {
      // 여기서 바로 권한 요청하지 않고 onConfirm 호출
      onConfirm();
    } catch (error) {
      console.error('권한 요청 실패:', error);
    } finally {
      setTimeout(() => {
        isProcessing = false;
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 배경 딤처리 - 클릭 불가능하게 */}
      <div className="fixed inset-0 bg-black/50 transition-opacity pointer-events-none" />
      
      {/* 모달 컨텐츠 */}
      <div className="relative z-[101] w-80 rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-xl font-bold text-gray-900 select-none">
          센서 권한을 허용해 주세요
        </h3>
        <p className="mb-6 text-gray-600 select-none">
          {modalMessage}
        </p>
        <button
          onClick={handlePermissionRequest}
          onTouchStart={handlePermissionRequest}
          className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors active:bg-gray-800"
          style={{ WebkitTapHighlightColor: 'transparent' }}
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
  const [menuIconColor, setMenuIconColor] = useState('#FF5218');
  const [currentBeta, setCurrentBeta] = useState(0);
  const [currentGamma, setCurrentGamma] = useState(0);
  const [menuIconScale, setMenuIconScale] = useState(1);
  const [startButtonOpacity, setStartButtonOpacity] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  // context hooks
  const { blurAmount, currentAlpha, setTargetAngles } = useBlur();
  const { showGuideMessage } = useGuide();
  const { isOrientationMode, setIsOrientationMode } = useMode();
  const { changeLanguage } = useLanguage();

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
        setShowModal(true);  // iOS에서는 항상 모달 표시
      } else {
        setPermissionGranted(true);
        setShowModal(false);
      }
    } else {
      setPermissionGranted(true);
      setShowModal(false);
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
        setTargetAngles(
          config.targetBeta1,
          config.targetGamma1,
          config.targetBeta2,
          config.targetGamma2
        );
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
  const handleStartClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setTutorialStep(1);
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

  // 언어 변경 핸들러 수정
  const handleLanguageChange = (lang) => {
    setLanguage(lang);  // 로컬 상태 업데이트
    changeLanguage(lang);  // Context 상태 업데이트 (setContextLanguage 대신 changeLanguage 사용)
    localStorage.setItem('language', lang);
  };

  // 언어 선택 컴포넌트
  const LanguageSelector = () => {
    const handleLanguageSelect = (lang, e) => {
      e.preventDefault();
      e.stopPropagation();
      handleLanguageChange(lang);
    };

    return (
      <div className="fixed bottom-[15vh] left-0 right-0 flex justify-center">
        <div className="text-xl font-bold text-black">
          <button 
            onClick={(e) => handleLanguageSelect('ko', e)}
            onTouchStart={(e) => handleLanguageSelect('ko', e)}
            className={`px-3 py-2 ${language === 'ko' ? 'text-black' : 'text-gray-400'}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={language === 'ko' ? "한국어 선택됨" : "한국어로 변경"}
          >
            Ko
          </button>
          <span className="mx-2" aria-hidden="true">|</span>
          <button 
            onClick={(e) => handleLanguageSelect('en', e)}
            onTouchStart={(e) => handleLanguageSelect('en', e)}
            className={`px-3 py-2 ${language === 'en' ? 'text-black' : 'text-gray-400'}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={language === 'en' ? "English selected" : "Change to English"}
          >
            En
          </button>
        </div>
      </div>
    );
  };

  // 시작하기 버튼 표시 타이머
  useEffect(() => {
    if (isHomePage) {
      const showTimer = setTimeout(() => {
        setShowStartButton(true);
        setTimeout(() => {
          setStartButtonOpacity(1);
        }, 100);
      }, 6000);
      return () => clearTimeout(showTimer);
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
        setTargetAngles(
          config.targetBeta1,
          config.targetGamma1,
          config.targetBeta2,
          config.targetGamma2
        );
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

  // 메뉴 아이콘 스크롤 감지 함수 수정
  useEffect(() => {
    const handleScroll = (e) => {
      const container = e.target;
      const scrollPosition = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const scrollRatio = scrollPosition / maxScroll;
      
      // 스크롤이 90% 이상 되었을 때 크기와 색상 모두 변경
      if (scrollRatio >= 0.9 && !showMenu) {
        setMenuIconColor('#FF8000');
        setMenuIconScale(1.3);
        
        // 0.3초 후에 원래 상태로 돌아오기
        setTimeout(() => {
          setMenuIconColor('#FF5218');
          setMenuIconScale(1);
        }, 500);
      }
    };

    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
      container.addEventListener('scroll', handleScroll, { passive: true });
    });

    return () => {
      containers.forEach(container => {
        container.removeEventListener('scroll', handleScroll);
      });
    };
  }, [showMenu]);

  // 메뉴 토글 함수 수정
  const toggleMenu = () => {
    setShowMenu(prev => {
      if (!prev) {
        setMenuIconColor('#FF5218'); // 메뉴가 열릴 때 검정색으로
      }
      return !prev;
    });
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
    const logTouch = (e) => {
      // 버튼인 경우에만 로그 출력
      if (e.target.tagName === 'BUTTON') {
        const buttonText = e.target.textContent?.trim();
        console.log(`${buttonText} 버튼에 ${e.type}`);
      }
    };

    // 이벤트 리스너 등록 시 passive: false 옵션 추가
    document.addEventListener('touchstart', logTouch, { passive: false });
    document.addEventListener('touchend', logTouch, { passive: false });
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        console.log(`${e.target.textContent?.trim()} 버튼 클릭됨`);
      }
    });

    return () => {
      document.removeEventListener('touchstart', logTouch);
      document.removeEventListener('touchend', logTouch);
    };
  }, []);

  // deviceorientation 이벤트 핸들러 수정
  useEffect(() => {
    const handleOrientation = (event) => {
      setCurrentBeta(event.beta || 0);
      setCurrentGamma(event.gamma || 0);
      // 기존의 alpha 처리 로직은 유지
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // 튜토리얼 관련 useEffect 수정
  useEffect(() => {
    if (tutorialStep > 0) {
      const currentConfig = pageConfig.tutorial[tutorialStep];
      if (currentConfig) {
        setTargetAngles(
          currentConfig.targetBeta1,
          currentConfig.targetGamma1,
          currentConfig.targetBeta2,
          currentConfig.targetGamma2
        );
      }
    }
  }, [tutorialStep, setTargetAngles]);

  // renderArtworkPage 함수 내의 각도 표시 부분
  const renderArtworkPage = () => {
    if (pageNumber === 0) return null;

    const config = pageConfig.pages[pageNumber];
    if (!config) return null;

    const pageContent = data[`page${pageNumber}`];
    if (!pageContent) return null;

    // 디바이스 초기 알파값 기준으로 회전 각도 계산
    const rotationAngle = config.rotationAngle;

    return (
      <div className="min-h-screen bg-base-color fixed w-full flex items-center justify-center">
        <div className="fixed top-2 left-0 right-0 text-center z-10 flex justify-center space-x-4">
          <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
          <p className="text-xl font-bold text-white">β: {Math.round(currentBeta)}°</p>
          <p className="text-xl font-bold text-white">γ: {Math.round(currentGamma)}°</p>
          <p className="text-xl font-bold text-white">blur: {Math.round(blurAmount)}</p>
        </div>
        {/* 메뉴 아이콘 */}
        <div className="fixed top-5 right-5 z-50">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="rounded-full p-2 shadow-lg flex items-center justify-center w-12 h-12 hover:bg-gray-800 transition-all z-100"
            style={{ 
              backgroundColor: menuIconColor,
              transform: `scale(${menuIconScale})`,
              transition: 'all 0.3s ease'
            }}
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

        {/* 메뉴 오버레이 */}
        {showMenu && <Menu {...menuProps} />}

        <ScreenReaderText
          currentPage={pageNumber}
          blurAmount={blurAmount}
          isModalOpen={showModal}
          tutorialStep={tutorialStep}
          onTutorialNext={handleTutorialNext}
        />
      </div>
    );
  };

  // 튜토리얼 관련 useEffect를 컴포넌트 최상위 레벨로 이동
  useEffect(() => {
    if (tutorialStep > 0) {
      const currentConfig = pageConfig.tutorial[tutorialStep];
      if (currentConfig && currentConfig.targetAlpha) {
        setTargetAngles(
          currentConfig.targetBeta1,
          currentConfig.targetGamma1,
          currentConfig.targetBeta2,
          currentConfig.targetGamma2
        );
      }
    }
  }, [tutorialStep, setTargetAngles]);

  // 튜토리얼 렌더링 함수에서는 useEffect 제거
  const renderTutorial = () => {
    const currentConfig = pageConfig.tutorial[tutorialStep];
    
    return (
      <div className="relative min-h-screen overflow-hidden bg-base-color">
        <div className="fixed top-2 left-0 right-0 text-center z-10">
          <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
          <p className="text-xl font-bold text-white">{Math.round(currentBeta)}°</p>
          <p className="text-xl font-bold text-white">{Math.round(currentGamma)}°</p>
          <p className="text-xl font-bold text-white">blur: {Math.round(blurAmount)}</p>
        </div>

        <div 
          className={currentConfig.containerClassName}
          style={{
            ...currentConfig.style,
            transform: `rotate(${currentConfig.rotationAngle}deg) translateX(-50%)`,
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease, transform 0.3s ease',
          }}
        >
          <div className={`p-4 ${currentConfig.bgColor} shadow-xl relative`}>
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
      <div className="min-h-screen fixed w-full flex items-center justify-center ">
        <div className="w-[100vw] h-[100vh] flex items-center justify-center">
          <div 
            className="container h-full overflow-y-auto overflow-x-hidden flex flex-col p-14 text-black leading-relaxed"
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
        <div className="fixed top-5 right-5 z-20">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="rounded-full bg-key-color p-2 shadow-lg flex items-center justify-center w-12 h-12 transition-colors"
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
      <div className="min-h-screen bg-gray-100 p-4 relative flex flex-col">
        {/* 타이틀과 각도 표시 영역 - fixed로 변경 */}
        <div className="fixed top-3 left-0 right-0 flex flex-col items-center space-y-2 text-center z-10">
          <h1 className="text-base leading-relaxed font-bold mb-4 font-medium whitespace-pre-line px-4">
            {data.home1.title}
          </h1>
          <div className="items-center space-y-2 text-center font-bold text-black">
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
        <div className="fixed bottom-3 left-0 right-0 flex flex-col items-center space-y-3">
          <button 
            onTouchStart={(e) => {
              e.preventDefault();
              handleStartClick();
            }}
            className="start-button w-48 bg-black px-6 py-4 text-xl font-bold text-white shadow-2xl"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              opacity: startButtonOpacity,
              transition: 'opacity 2s ease-in'
            }}
          >
            {data.home1.startButton}
          </button>
          <LanguageSelector />
          
        </div>
      </div>
    );
  };

  const handleModeChange = () => {
    setIsOrientationMode(prev => {
      const newMode = !prev;
      setAnnouncement(
        language === 'ko' 
          ? `각도 모드가 ${newMode ? '켜졌습니다' : '꺼졌습니다'}`
          : `Angle mode ${newMode ? 'enabled' : 'disabled'}`
      );
      return newMode;
    });
  };

  // 메인 렌더링 부분 수정
  return (
    <>
      <Modal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={requestPermission}
      />

      {/* 스크린리더 텍스트 추가 */}
      <ScreenReaderText 
        currentPage={pageNumber}
        blurAmount={blurAmount}
        isModalOpen={showModal}
        tutorialStep={tutorialStep}
        onTutorialNext={handleTutorialNext}
      />

      <LiveAnnouncer 
        message={announcement}
        clearMessage={() => setAnnouncement('')}
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
