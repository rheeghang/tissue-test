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

      const tolerance = 17;
      const easeStartDistance = tolerance + 20; // 블러 감소 시작 지점
      const difference = Math.abs(alpha - targetAlpha);
      
      if (difference <= tolerance) {
        // tolerance 내부: 블러 없음
        setBlurAmount(0);
      } else if (difference <= easeStartDistance) {
        // ease 구간: 부드러운 블러 증가
        const easeProgress = (difference - tolerance) / 20; // 0~1 사이 값
        const blur = easeProgress * 20; // 최대 30까지 부드럽게 증가
        setBlurAmount(blur);
      } else {
        // 최대 블러
        setBlurAmount(20);
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