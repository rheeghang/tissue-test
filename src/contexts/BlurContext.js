import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const BlurContext = createContext();

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const isUnlockedRef = useRef(isUnlocked);
  const isTutorialModeRef = useRef(false);

  useEffect(() => {
    isUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.alpha == null) return;
      const alpha = event.alpha;
      setCurrentAlpha(alpha);
      
      if (!isUnlockedRef.current) {
        const tolerance = 30; 
        const maxBlur = 20;
        
        const alphaDifference = Math.abs(alpha - targetAlpha);
        
        if (alphaDifference <= tolerance) {
          setBlurAmount(0);
          setIsUnlocked(true);
          console.log("✅ 언락 조건 충족! blur = 0");
        } else {
          const blur = Math.min(maxBlur, (alphaDifference - tolerance) / 3);
          setBlurAmount(blur);
        }
      } else {
        // isUnlocked가 true일 때는 항상 blurAmount를 0으로 유지
        setBlurAmount(0);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [targetAlpha]);

  const setTargetAngles = (alpha, isTutorial = false) => {
    setTargetAlpha(alpha);
    setIsUnlocked(false);
    isUnlockedRef.current = false;
    isTutorialModeRef.current = isTutorial;
    console.log("🔒 타겟 알파 설정! isUnlocked = false, isTutorial =", isTutorial);
  };

  return (
    <BlurContext.Provider value={{
      blurAmount,
      currentAlpha,
      setTargetAngles,
      setIsUnlocked,
      isUnlocked
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext);