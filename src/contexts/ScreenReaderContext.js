import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBlur } from './BlurContext';
import { useLanguage } from './LanguageContext';
import ko from '../i18n/ko.json';
import en from '../i18n/en.json';
import pages from '../config/pages.json';

const ScreenReaderContext = createContext();

export const useScreenReader = () => {
  const context = useContext(ScreenReaderContext);
  if (!context) {
    throw new Error('useScreenReader must be used within a ScreenReaderProvider');
  }
  return context;
};

export const ScreenReaderProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [blurAmount, setBlurAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [shouldReadContent, setShouldReadContent] = useState(false);
  const [hasReadContent, setHasReadContent] = useState(false);
  const { isUnlocked } = useBlur();
  const { language } = useLanguage();

  const translations = language === 'ko' ? ko : en;

  // isUnlocked와 blurAmount에 따라 shouldReadContent 설정
  useEffect(() => {
    if (isUnlocked && blurAmount === 0) {
      setShouldReadContent(true);
    } else {
      setShouldReadContent(false);
    }
  }, [isUnlocked, blurAmount]);

  // 페이지 변경 시 상태 초기화
  useEffect(() => {
    setHasReadContent(false);
    setShouldReadContent(false);
  }, [currentPage]);

  // 튜토리얼 단계 변경 시 상태 초기화
  useEffect(() => {
    setHasReadContent(false);
    setShouldReadContent(false);
  }, [tutorialStep]);

  const getInitialDescription = () => {
    if (currentPage > 0) {
      return translations.pages[`page${currentPage}`]?.initialDescription || '';
    }
    return '';
  };

  const getPageContent = () => {
    if (currentPage > 0) {
      return translations.pages[`page${currentPage}`]?.content || '';
    }
    return '';
  };

  return (
    <ScreenReaderContext.Provider value={{
      currentPage,
      setCurrentPage,
      blurAmount,
      setBlurAmount,
      isModalOpen,
      setIsModalOpen,
      tutorialStep,
      setTutorialStep,
      shouldReadContent,
      setShouldReadContent,
      hasReadContent,
      setHasReadContent,
      isUnlocked,
      language,
      getInitialDescription,
      getPageContent
    }}>
      {children}
    </ScreenReaderContext.Provider>
  );
}; 