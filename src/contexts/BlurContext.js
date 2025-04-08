import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const BlurContext = createContext();

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const isUnlockedRef = useRef(isUnlocked);

  useEffect(() => {
    isUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.alpha == null) return;
      const alpha = event.alpha;
      setCurrentAlpha(alpha);  // 항상 현재 각도 업데이트
      
      if (!isUnlockedRef.current) {  // isUnlocked가 false일 때만 블러 계산
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
  }, [targetAlpha]);

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