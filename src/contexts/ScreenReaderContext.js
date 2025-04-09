import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useBlur } from './BlurContext';
import ko from '../i18n/ko.json';
import en from '../i18n/en.json';

const ScreenReaderContext = createContext();

export const useScreenReader = () => {
  const context = useContext(ScreenReaderContext);
  if (!context) {
    throw new Error('useScreenReader must be used within a ScreenReaderProvider');
  }
  return context;
};

export const ScreenReaderProvider = ({ children }) => {
  const { language } = useLanguage();
  const { blurAmount } = useBlur();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [shouldReadContent, setShouldReadContent] = useState(false);
  const [hasReadContent, setHasReadContent] = useState(false);

  const translations = language === 'ko' ? ko : en;

  useEffect(() => {
    if (tutorialStep === 0 && currentPage > 0) {
      setShouldReadContent(true);
    }
  }, [tutorialStep, currentPage]);

  const getInitialDescription = () => {
    return translations.initialDescription;
  };

  const getPageContent = () => {
    if (currentPage === 0) return '';
    return translations.pages[`page${currentPage}`] || '';
  };

  const value = {
    currentPage,
    setCurrentPage,
    blurAmount,
    isModalOpen,
    setIsModalOpen,
    tutorialStep,
    setTutorialStep,
    shouldReadContent,
    setShouldReadContent,
    hasReadContent,
    setHasReadContent,
    getInitialDescription,
    getPageContent
  };

  return (
    <ScreenReaderContext.Provider value={value}>
      {children}
    </ScreenReaderContext.Provider>
  );
}; 