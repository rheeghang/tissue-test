import React, { useState, useEffect, useRef } from 'react';

const Home = () => {
  const [smoothedAlpha, setSmoothedAlpha] = useState(0);
  const prevAlpha = useRef(0);
  const alphaBuffer = useRef([]);
  const BUFFER_SIZE = 10; // 버퍼 크기 (클수록 더 부드러움)
  const THRESHOLD = 1; // 최소 변화 임계값 (도)

  // 이동 평균 계산
  const calculateMovingAverage = (values) => {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  // 각도 정규화 (0-360)
  const normalizeAngle = (angle) => {
    return ((angle % 360) + 360) % 360;
  };

  // 각도 차이 계산
  const getAngleDifference = (angle1, angle2) => {
    const diff = normalizeAngle(angle1 - angle2);
    return diff > 180 ? diff - 360 : diff;
  };

  const updateOrientation = (event) => {
    const newAlpha = event.alpha || 0;
    
    // 버퍼에 새 값 추가
    alphaBuffer.current.push(newAlpha);
    if (alphaBuffer.current.length > BUFFER_SIZE) {
      alphaBuffer.current.shift();
    }

    // 이동 평균 계산
    const avgAlpha = calculateMovingAverage(alphaBuffer.current);
    
    // 이전 각도와의 차이가 임계값보다 큰 경우에만 업데이트
    const diff = Math.abs(getAngleDifference(avgAlpha, prevAlpha.current));
    if (diff > THRESHOLD) {
      // 부드러운 보간 적용
      const smoothedValue = prevAlpha.current + (avgAlpha - prevAlpha.current) * 0.1;
      setSmoothedAlpha(smoothedValue);
      prevAlpha.current = smoothedValue;
    }
  };

  useEffect(() => {
    const handleOrientation = (event) => {
      requestAnimationFrame(() => updateOrientation(event));
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-exhibition-bg">
      {/* 회전하는 텍스트 박스 */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        <div
          className="w-4/5 max-w-2xl bg-white p-8 rounded-lg"
          style={{
            transform: `rotate(${smoothedAlpha}deg)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform'
          }}
        >
          {/* 텍스트 내용 */}
        </div>
      </div>

      {/* 각도 표시 UI */}
      <div className="fixed top-4 right-4 bg-black bg-opacity-50 p-4 rounded-lg text-white" style={{ zIndex: 20 }}>
        <p className="mb-2 text-3xl">
          회전 각도: {Math.round(smoothedAlpha)}°
        </p>
      </div>
    </div>
  );
};

export default Home; 