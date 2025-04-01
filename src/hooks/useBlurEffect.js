import { useState, useEffect } from 'react';
import { useMode } from '../contexts/ModeContext';

export const useBlurEffect = (targetAlpha) => {
  const { isOrientationMode } = useMode();
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [blurAmount, setBlurAmount] = useState(0);
  const tolerance = 25;

  useEffect(() => {
    const handleOrientation = (event) => {
      if (!isOrientationMode) {
        setBlurAmount(0);
        return;
      }

      const alpha = event.alpha || 0;
      setCurrentAlpha(alpha);

      const difference = Math.abs(alpha - targetAlpha);
      if (difference <= tolerance) {
        setBlurAmount(0);
      } else {
        const maxBlur = 30;
        const blur = Math.min(maxBlur, (difference - tolerance) * 0.5);
        setBlurAmount(blur);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [targetAlpha, isOrientationMode]);

  return { blurAmount, currentAlpha, tolerance };
}; 