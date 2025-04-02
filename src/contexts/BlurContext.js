import React, { createContext, useContext, useState, useEffect } from 'react';

const BlurContext = createContext();

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);

  useEffect(() => {
    const handleOrientation = (event) => {
      const alpha = event.alpha || 0;
      setCurrentAlpha(alpha);

      // 현재 각도와 목표 각도의 차이에 따른 블러 계산
      const difference = Math.abs(alpha - targetAlpha);
      if (difference <= 17) { // tolerance 값
        setBlurAmount(0);
      } else {
        const blur = Math.min(difference * 0.5, 30); // 최대 블러값 30
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