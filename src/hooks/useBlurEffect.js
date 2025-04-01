import { useState, useEffect } from 'react';
import { useMode } from '../contexts/ModeContext';

export const useBlurEffect = (targetAlpha) => {
  const [blurAmount, setBlurAmount] = useState(30);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const { isOrientationMode } = useMode();

  const tolerance = 25;
  const clearThreshold = 35;
  const maxBlur = 30;
  const maxDistance = 45;

  useEffect(() => {
    const handleOrientation = (event) => {
      if (!isOrientationMode) {
        setBlurAmount(0);
        return;
      }

      const alpha = event.alpha || 0;
      setCurrentAlpha(alpha);
      const distance = Math.abs(alpha - targetAlpha);
      
      let blur = maxBlur;
      if (distance <= tolerance) {
        blur = 0;
      } else if (distance <= clearThreshold) {
        blur = (distance - tolerance) * (maxBlur / (clearThreshold - tolerance));
      }
      
      setBlurAmount(blur);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isOrientationMode, targetAlpha]);

  return { blurAmount, currentAlpha, tolerance };
}; 