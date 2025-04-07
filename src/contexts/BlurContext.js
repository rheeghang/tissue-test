import React, { createContext, useContext, useState, useEffect } from 'react';

const BlurContext = createContext();

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [targetAlpha, setTargetAlpha] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    let lastValidAlpha = null;

    const handleOrientation = (event) => {
      let alpha = event.alpha;
      
      // 알파값이 null이거나 갑자기 0이 되는 경우 이전 유효한 값 사용
      if (alpha === null || (lastValidAlpha !== null && Math.abs(alpha - lastValidAlpha) > 180)) {
        alpha = lastValidAlpha || 0;
      } else {
        lastValidAlpha = alpha;
      }

      setCurrentAlpha(alpha);
      
      if (isUnlocked) {
        setBlurAmount(0);
        return;
      }
      
      const tolerance = 30;
      const maxBlur = 20;
      
      // 알파값 정규화 (0-360 범위로)
      const normalizedAlpha = ((alpha % 360) + 360) % 360;
      const normalizedTarget = ((targetAlpha % 360) + 360) % 360;
      
      // 최단 거리 계산
      let alphaDifference = Math.abs(normalizedAlpha - normalizedTarget);
      if (alphaDifference > 180) {
        alphaDifference = 360 - alphaDifference;
      }
      
      // 디버깅용 로그
      console.log({
        rawAlpha: alpha,
        normalized: normalizedAlpha,
        target: normalizedTarget,
        difference: alphaDifference,
        blur: alphaDifference <= tolerance ? 0 : Math.min(maxBlur, (alphaDifference - tolerance) / 3)
      });
      
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
  }, [targetAlpha, isUnlocked]);

  return (
    <BlurContext.Provider value={{
      blurAmount,
      currentAlpha,
      setTargetAngles: (alpha) => {
        // 타겟 알파값도 정규화
        const normalizedAlpha = ((alpha % 360) + 360) % 360;
        setTargetAlpha(normalizedAlpha);
        setIsUnlocked(false);
      },
      setIsUnlocked
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext); 