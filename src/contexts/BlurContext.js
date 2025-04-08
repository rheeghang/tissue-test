import React, { createContext, useContext, useState, useEffect } from 'react';

const BlurContext = createContext();

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.alpha == null) return;
      const alpha = event.alpha;
      setCurrentAlpha(alpha);  // 항상 현재 각도 업데이트
      
      if (!isUnlocked) {  // 블러 효과만 isUnlocked 상태에 따라 제어
        const tolerance = 30; 
        const maxBlur = 20;
        
        const alphaDifference = Math.abs(alpha - targetAlpha);
        
        if (alphaDifference <= tolerance) {
          setBlurAmount(0);
          setIsUnlocked(true);
        } else {
          const blur = Math.min(maxBlur, (alphaDifference - tolerance) / 3);
          setBlurAmount(blur);
        }
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [targetAlpha, isUnlocked]);

  return (
    <BlurContext.Provider value={{
      blurAmount,
      currentAlpha,
      setTargetAngles: (alpha) => {
        setTargetAlpha(alpha);
        setIsUnlocked(false);
      },
      setIsUnlocked,
      isUnlocked
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext);