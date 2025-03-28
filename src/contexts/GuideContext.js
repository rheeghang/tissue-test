import React, { createContext, useContext, useState } from 'react';
import Guide from '../components/Guide';

const GuideContext = createContext();

export const GuideProvider = ({ children }) => {
  const [showGuide, setShowGuide] = useState(false);

  const showGuideMessage = () => {
    setShowGuide(true);
    setTimeout(() => {
      setShowGuide(false);
    }, 3000);
  };

  return (
    <GuideContext.Provider value={{ showGuideMessage }}>
      {children}
      <Guide show={showGuide} />
    </GuideContext.Provider>
  );
};

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
}; 