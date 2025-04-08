import React, { createContext, useContext, useState, useEffect } from 'react';

const BlurContext = createContext();

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [initialAlpha, setInitialAlpha] = useState(null);

  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.alpha === null || event.alpha === undefined) return;
      
      if (initialAlpha === null) {
        setInitialAlpha(event.alpha);
        setCurrentAlpha(0);
        return;
      }

      const relativeAlpha = event.alpha - initialAlpha;
      setCurrentAlpha(relativeAlpha);
      
      if (isUnlocked) {
        setBlurAmount(0);
        return;
      }
      
      const tolerance = 30; 
      const maxBlur = 20;
      
      const alphaDifference = Math.abs(relativeAlpha - targetAlpha);
      
      if (alphaDifference <= tolerance) {
        setBlurAmount(0);
        setIsUnlocked(true);
      } else {
        const blur = Math.min(maxBlur, (alphaDifference - tolerance) / 3);
        setBlurAmount(blur);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [targetAlpha, isUnlocked, initialAlpha]);

  return (
    <BlurContext.Provider value={{
      blurAmount,
      currentAlpha,
      setTargetAngles: (alpha) => {
        setTargetAlpha(alpha);
        setIsUnlocked(false);
        setInitialAlpha(null);
      },
      setIsUnlocked
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext); 