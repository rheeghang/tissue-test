import React, { createContext, useContext, useState, useEffect } from 'react';

const BlurContext = createContext();

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [baseAlpha, setBaseAlpha] = useState(null);

  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.alpha === null || event.alpha === undefined) return;

      // 페이지 첫 로드 또는 페이지 전환 시
      if (baseAlpha === null) {
        setBaseAlpha(event.alpha);
        setCurrentAlpha(0);
        return;
      }

      // baseAlpha 기준으로 상대적인 알파값 계산
      let relativeAlpha = event.alpha - baseAlpha;
      
      // 360도 회전 시 각도 보정
      if (relativeAlpha > 180) relativeAlpha -= 360;
      if (relativeAlpha < -180) relativeAlpha += 360;
      
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
  }, [targetAlpha, isUnlocked, baseAlpha]);

  return (
    <BlurContext.Provider value={{
      blurAmount,
      currentAlpha,
      setTargetAngles: (alpha) => {
        setTargetAlpha(alpha);
        setIsUnlocked(false);
        setBaseAlpha(null);  // 페이지 전환 시 기준점 리셋
      },
      setIsUnlocked
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext); 