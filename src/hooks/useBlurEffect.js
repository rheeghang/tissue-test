import { useState, useEffect } from 'react';
import { useMode } from '../contexts/ModeContext';

export const useBlurEffect = (targetAlpha) => {
  const [blurAmount, setBlurAmount] = useState(30);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const { isOrientationMode } = useMode();

  // 고정된 기본값 사용
  const tolerance = 25;
  const maxBlur = 30;

  useEffect(() => {
    const handleOrientation = (event) => {
      if (!isOrientationMode) {
        setBlurAmount(0);
        return;
      }

      const alpha = event.alpha || 0;
      setCurrentAlpha(alpha);
      const distance = Math.abs(alpha - targetAlpha);
      
      // 360도 회전을 고려한 최단 거리 계산
      const shortestDistance = Math.min(
        distance,
        Math.abs(distance - 360),
        Math.abs(distance + 360)
      );

      // 단순화된 블러 계산
      if (shortestDistance <= tolerance) {
        setBlurAmount(0);
      } else {
        setBlurAmount(maxBlur);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isOrientationMode, targetAlpha]);

  return { blurAmount, currentAlpha, tolerance };
}; 