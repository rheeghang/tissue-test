import React, { createContext, useContext, useState, useEffect } from 'react';

const BlurContext = createContext();

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [currentBeta, setCurrentBeta] = useState(0);
  const [currentGamma, setCurrentGamma] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);

  useEffect(() => {
    const handleOrientation = (event) => {
      const alpha = event.alpha || 0;
      setCurrentAlpha(alpha);

      const tolerance = 17;
      const maxBlur = 10; // 최대 블러 값
      const difference = Math.abs(alpha - targetAlpha);
      
      if (difference <= tolerance) {
        // tolerance 내부: 블러 없음
        setBlurAmount(0);
      } else {
        // 차이에 따른 블러 계산 (최대 20px)
        const blur = Math.min(maxBlur, (difference - tolerance) / 3);
        setBlurAmount(blur);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [targetAlpha]);

  return (
    <BlurContext.Provider value={{
      blurAmount,
      currentAlpha,
      setTargetAlpha
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext); 