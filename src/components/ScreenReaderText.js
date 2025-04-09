import React, { useEffect, useState } from 'react';
import { useScreenReader } from '../contexts/ScreenReaderContext';
import { useBlur } from '../contexts/BlurContext';
import { useLanguage } from '../contexts/LanguageContext';
import ko from '../i18n/ko.json';
import en from '../i18n/en.json';
import pages from '../config/pages.json';

const ScreenReaderText = () => {
  const {
    shouldReadContent,
    hasReadContent,
    setHasReadContent,
    tutorialStep,
    getInitialDescription,
    getPageContent,
    currentPage
  } = useScreenReader();

  const { isUnlocked, blurAmount } = useBlur();
  const { language } = useLanguage();
  const [prevPage, setPrevPage] = useState(currentPage);
  const [hasReadTutorial, setHasReadTutorial] = useState(false);

  const translations = language === 'ko' ? ko : en;

  // 페이지 변경 감지
  useEffect(() => {
    if (currentPage !== prevPage) {
      setPrevPage(currentPage);
      setHasReadContent(false);
      setHasReadTutorial(false);
    }
  }, [currentPage, prevPage]);

  // 콘텐츠를 한 번만 읽도록 처리
  useEffect(() => {
    if (shouldReadContent && !hasReadContent && isUnlocked && blurAmount === 0) {
      const timer = setTimeout(() => {
        setHasReadContent(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shouldReadContent, hasReadContent, isUnlocked, blurAmount]);

  // 튜토리얼 콘텐츠 읽기 완료 처리
  useEffect(() => {
    if (tutorialStep > 0 && isUnlocked && blurAmount === 0 && !hasReadTutorial) {
      const timer = setTimeout(() => {
        setHasReadTutorial(true);
      }, 3000); // 콘텐츠 읽기 시간 고려

      return () => clearTimeout(timer);
    }
  }, [tutorialStep, isUnlocked, blurAmount, hasReadTutorial]);

  // 콘텐츠 읽기 완료 처리
  useEffect(() => {
    if (shouldReadContent && !hasReadContent) {
      const timer = setTimeout(() => {
        setHasReadContent(true);
      }, 3000); // 콘텐츠를 읽는 시간을 고려한 지연

      return () => clearTimeout(timer);
    }
  }, [shouldReadContent, hasReadContent, setHasReadContent]);

  // 1. 튜토리얼 관련 텍스트
  const renderTutorialText = () => {
    if (tutorialStep > 0) {
      const tutorialContent = translations.tutorial[`step${tutorialStep}`];
      return (
        <>
          {/* 튜토리얼 단계 안내 */}
          <div 
            className="sr-only" 
            aria-live="assertive" 
            role="status"
          >
            {`튜토리얼 ${tutorialStep}`}
          </div>
          
          {/* 튜토리얼 콘텐츠와 다음 단계 안내 */}
          {isUnlocked && blurAmount === 0 && (
            <>
              <div 
                className="sr-only" 
                aria-live="polite" 
                role="article"
              >
                {tutorialContent}
              </div>
              <div 
                className="sr-only" 
                aria-live="polite" 
                role="alert"
              >
                더블탭하면 다음 단계로 넘어갑니다.
              </div>
            </>
          )}
        </>
      );
    }
    return null;
  };

  // 2. 아트워크 페이지 관련 텍스트
  const renderArtworkText = () => {
    if (currentPage > 0) {
      const pageTitle = translations.pages[`page${currentPage}`]?.title || '';
      const pageConfig = pages.find(page => page.id === currentPage);
      const rotationAngle = pageConfig?.rotationAngle || 0;

      return (
        <>
          {/* 페이지 전환 안내 */}
          {currentPage !== prevPage && (
            <div 
              className="sr-only" 
              aria-live="assertive" 
              role="alert"
            >
              {`${pageTitle}에 있습니다. 텍스트가 ${rotationAngle}도 회전되어 있습니다. 화면을 돌려 설명을 들어보세요.`}
            </div>
          )}
          
          {/* 페이지 콘텐츠 */}
          {shouldReadContent && isUnlocked && blurAmount === 0 && (
            <div 
              className="sr-only" 
              aria-live="assertive" 
              role="article"
              aria-label={`${pageTitle}의 내용`}
            >
              {getPageContent()}
            </div>
          )}
        </>
      );
    }
    return null;
  };

  // 3. 일반 페이지 관련 텍스트
  const renderPageText = () => {
    if (!shouldReadContent && !hasReadContent && tutorialStep === 0) {
      return (
        <div 
          className="sr-only" 
          aria-live="polite" 
          role="status"
        >
          {getInitialDescription()}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {renderTutorialText()}
      {renderArtworkText()}
      {renderPageText()}
    </>
  );
};

export default ScreenReaderText; 