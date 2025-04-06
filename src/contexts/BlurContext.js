import React, { createContext, useContext, useState, useEffect } from 'react';

const BlurContext = createContext();

export const BlurProvider = ({ children }) => {
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentBeta, setCurrentBeta] = useState(0);
  const [currentGamma, setCurrentGamma] = useState(0);
  const [targetBeta1, setTargetBeta1] = useState(0);
  const [targetGamma1, setTargetGamma1] = useState(0);
  const [targetBeta2, setTargetBeta2] = useState(0);
  const [targetGamma2, setTargetGamma2] = useState(0);

  useEffect(() => {
    const handleOrientation = (event) => {
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;
      
      setCurrentBeta(beta);
      setCurrentGamma(gamma);
      
      const tolerance = 20;
      const maxBlur = 20;
      
      // 두 기준에 대한 차이 계산
      const betaDifference1 = Math.abs(beta - targetBeta1);
      const gammaDifference1 = Math.abs(gamma - targetGamma1);
      
      const betaDifference2 = Math.abs(beta - targetBeta2);
      const gammaDifference2 = Math.abs(gamma - targetGamma2);
      
      // 두 기준 중 하나라도 만족하면 블러 제거
      const isInRange1 = betaDifference1 <= tolerance && gammaDifference1 <= tolerance;
      const isInRange2 = betaDifference2 <= tolerance && gammaDifference2 <= tolerance;
      
      if (isInRange1 || isInRange2) {
        setBlurAmount(0);
      } else {
        // 두 기준 중 더 가까운 쪽의 차이값으로 블러 계산
        const maxDifference1 = Math.max(betaDifference1, gammaDifference1);
        const maxDifference2 = Math.max(betaDifference2, gammaDifference2);
        const minDifference = Math.min(maxDifference1, maxDifference2);
        const blur = Math.min(maxBlur, (minDifference - tolerance) / 3);
        setBlurAmount(blur);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [targetBeta1, targetGamma1, targetBeta2, targetGamma2]);

  return (
    <BlurContext.Provider value={{
      blurAmount,
      currentBeta,
      currentGamma,
      setTargetAngles: (beta1, gamma1, beta2, gamma2) => {
        setTargetBeta1(beta1);
        setTargetGamma1(gamma1);
        setTargetBeta2(beta2);
        setTargetGamma2(gamma2);
      }
    }}>
      {children}
    </BlurContext.Provider>
  );
};

export const useBlur = () => useContext(BlurContext); 