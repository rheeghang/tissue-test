import React, { useEffect, useState } from 'react';
import { useScreenReader } from '../contexts/ScreenReaderContext';
import ko from '../i18n/ko.json';
import en from '../i18n/en.json';
import pages from '../config/pages.json';

const ScreenReaderText = () => {
  const { 
    currentPage,
    blurAmount,
    isModalOpen,
    tutorialStep,
    shouldReadContent,
    hasReadContent,
    setHasReadContent,
    getInitialDescription,
    getPageContent,
    isUnlocked,
    language
  } = useScreenReader();

  const [prevPage, setPrevPage] = useState(currentPage);
  const translations = language === 'ko' ? ko : en;

  // 이전 페이지 상태 업데이트
  useEffect(() => {
    setPrevPage(currentPage);
  }, [currentPage]);

  // 콘텐츠 읽기 완료 처리
  useEffect(() => {
    if (shouldReadContent && !hasReadContent) {
      console.log('스크린 리더: 콘텐츠 읽기 시작');
      const timer = setTimeout(() => {
        setHasReadContent(true);
        console.log('스크린 리더: 콘텐츠 읽기 완료');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shouldReadContent, hasReadContent, setHasReadContent]);

  // 1. 튜토리얼 관련 텍스트
  const renderTutorialText = () => {
    if (tutorialStep > 0) {
      console.log('스크린 리더: 튜토리얼 단계', tutorialStep);
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
      console.log('스크린 리더: 아트워크 페이지', currentPage);
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
              aria-atomic="true"
            >
              {`${pageTitle}에 있습니다. 텍스트가 ${rotationAngle}도 회전되어 있습니다. 화면을 돌려 설명을 들어보세요.`}
            </div>
          )}
          
          {/* 페이지 콘텐츠 */}
          {shouldReadContent && (
            <div 
              className="sr-only" 
              aria-live="assertive" 
              role="article"
              aria-atomic="true"
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
      console.log('스크린 리더: 초기 설명 읽기');
      return (
        <div 
          className="sr-only" 
          aria-live="assertive" 
          role="status"
          aria-atomic="true"
        >
          {getInitialDescription()}
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="sr-only" 
      aria-live="assertive"
      role="region"
      aria-label="스크린 리더 콘텐츠"
      aria-atomic="true"
    >
      {renderTutorialText()}
      {renderArtworkText()}
      {renderPageText()}
    </div>
  );
};

export default ScreenReaderText; 