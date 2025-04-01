import React, { createContext, useContext, useState, useEffect } from 'react';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  const [isOrientationMode, setIsOrientationMode] = useState(() => {
    // localStorage에서 저장된 값을 불러옴
    const savedMode = localStorage.getItem('orientationMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  // isOrientationMode가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('orientationMode', JSON.stringify(isOrientationMode));
  }, [isOrientationMode]);

  return (
    <ModeContext.Provider value={{ isOrientationMode, setIsOrientationMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
