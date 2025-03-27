import React, { createContext, useState, useContext, useEffect } from 'react';

const AngleModeContext = createContext();

export const AngleModeProvider = ({ children }) => {
  // localStorage에서 초기 상태 불러오기
  const [isAngleMode, setIsAngleMode] = useState(() => {
    const saved = localStorage.getItem('angleMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 각도 모드 변경 함수
  const toggleAngleMode = () => {
    const newMode = !isAngleMode;
    setIsAngleMode(newMode);
    localStorage.setItem('angleMode', JSON.stringify(newMode));
  };

  return (
    <AngleModeContext.Provider value={{ isAngleMode, toggleAngleMode }}>
      {children}
    </AngleModeContext.Provider>
  );
};

// 커스텀 훅
export const useAngleMode = () => {
  const context = useContext(AngleModeContext);
  if (context === undefined) {
    throw new Error('useAngleMode must be used within an AngleModeProvider');
  }
  return context;
}; 