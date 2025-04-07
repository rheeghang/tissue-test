import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import pageConfig from '../config/pages.json';

const ScreenReaderText = ({ 
  currentPage, 
  blurAmount,
  isModalOpen,
  tutorialStep,
  onTutorialNext
}) => {
  const { language } = useLanguage();
  const [shouldReadContent, setShouldReadContent] = useState(false);
  const [hasReadContent, setHasReadContent] = useState(false);

  // 현재 페이지의 데이터 가져오기
  const data = language === 'ko' ? koData : enData;
  const pageData = currentPage === 0 ? data.home1 : 
                  currentPage === 'about' ? data.about :
                  data[`page${currentPage}`];
  const config = currentPage === 0 ? null : 
                tutorialStep > 0 ? pageConfig.tutorial[tutorialStep] :
                pageConfig.pages[currentPage];
  const rotationAngle = config?.rotationAngle;

  useEffect(() => {
    // 튜토리얼은 무조건 읽기
    if (tutorialStep > 0) {
      setShouldReadContent(true);
    }
    // about 페이지는 바로 읽기
    else if (currentPage === 'about') {
      setShouldReadContent(true);
    }
    // 일반 페이지는 blur 값으로 판단
    else if (blurAmount === 0 && !hasReadContent) {
      setShouldReadContent(true);
    }
  }, [blurAmount, hasReadContent, tutorialStep, currentPage]);

  // 더블 탭 이벤트 핸들러 추가
  useEffect(() => {
    if (!tutorialStep) return;

    let lastTap = 0;
    const handleDoubleTap = (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 500 && tapLength > 0) {
        onTutorialNext();
      }
      lastTap = currentTime;
    };

    document.addEventListener('touchend', handleDoubleTap);
    return () => document.removeEventListener('touchend', handleDoubleTap);
  }, [tutorialStep, onTutorialNext]);

  const getInitialDescription = () => {
    if (currentPage === 'about') {
      return ''; // about 페이지는 초기 설명 없음
    }
    if (currentPage === 0) {
      if (language === 'ko') {
        return `${data.home1.title}. 
        화면을 기울이니 중앙에 있는 사각형의 모양이 동그랗게 변합니다.
        하단에는 시작하기 버튼과 언어 선택 버튼이 있습니다.`;
      } else {
        return `${data.home1.title}. 
        when you tilt the screen, the box shape change.
        At the bottom, there are Start and Language selection buttons.`;
      }
    } else if (tutorialStep > 0) {
      if (language === 'ko') {
        return `튜토리얼 ${tutorialStep}. 텍스트는 ${rotationAngle}도 돌아가 있습니다.`;
      } else {
        return `Tutorial step ${tutorialStep}. The text is rotated ${rotationAngle} degrees.`;
      }
    } else if (!pageData || !rotationAngle) {
      return '';
    } else {
      // 작품 페이지일 때 (기존 코드)
      if (language === 'ko') {
        return `현재 ${pageData.title}페이지에 있습니다. 전시 텍스트는 ${rotationAngle}도 돌아가 있습니다. 
        화면을 ${rotationAngle}도 돌려 전시 설명을 들어보세요. 
        우측 상단에는 메뉴 버튼이 있습니다.`;
      } else {
        return `You are currently on ${pageData.title} page. The exhibition text is rotated ${rotationAngle} degrees. 
        Please rotate your screen ${rotationAngle} degrees to hear the exhibition description. 
        There is a menu button in the upper right corner.`;
      }
    }
  };

  const getPageContent = () => {
    if (!pageData || !shouldReadContent) return '';
    
    // about 페이지
    if (currentPage === 'about') {
      if (language === 'ko') {
        return `${pageData.title}. ${pageData.body}`;
      } else {
        return `${pageData.title}. ${pageData.body}`;
      }
    }
    
    // 튜토리얼
    if (tutorialStep > 0) {
      if (language === 'ko') {
        return `${data.tutorial[`step${tutorialStep}`]}
        화면을 더블 탭하면 다음 단계로 넘어갑니다.`;
      } else {
        return `${data.tutorial[`step${tutorialStep}`]}
        Double tap the screen to proceed to the next step.`;
      }
    }
    
    // 홈페이지
    if (currentPage === 0) {
      return '';
    }
    
    // 작품 페이지
    if (language === 'ko') {
      return `
        제목: ${pageData.title}.
        작가: ${pageData.artist}.
        ${pageData.caption}.
        ${pageData.body}.
        우측 상단에는 메뉴 버튼이 있습니다.
      `;
    } else {
      return `
        Title: ${pageData.title}.
        Artist: ${pageData.artist}.
        ${pageData.caption}.
        ${pageData.body}.
        There is a menu button in the upper right corner.
      `;
    }
  };

  // 컨텐츠를 다 읽었으면 상태 업데이트
  useEffect(() => {
    if (shouldReadContent) {
      const timer = setTimeout(() => {
        setHasReadContent(true);
        setShouldReadContent(false);
      }, 1000); // 읽기 시작 후 적절한 시간 설정

      return () => clearTimeout(timer);
    }
  }, [shouldReadContent]);

  // 페이지가 변경되면 읽기 상태 초기화
  useEffect(() => {
    setHasReadContent(false);
    setShouldReadContent(false);
  }, [currentPage]);

  return (
    <>
      <div 
        className="sr-only" 
        aria-live="polite" 
        role="status"
      >
        {!shouldReadContent && !hasReadContent && getInitialDescription()}
      </div>
      
      {shouldReadContent && (
        <div 
          className="sr-only" 
          aria-live="assertive" 
          role="article"
        >
          {getPageContent()}
        </div>
      )}
    </>
  );
};

export default ScreenReaderText; 