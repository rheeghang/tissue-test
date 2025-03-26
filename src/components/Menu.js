import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';

const Menu = ({ isOpen, onClose }) => {
  const [isAngleMode, setIsAngleMode] = useState(false);
  const [isShakeDetected, setIsShakeDetected] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [shakeSpeed, setShakeSpeed] = useState(0);
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');

  const menuItems = [
    { id: 1, label: '홈보이지 않는 조각들: 공기조각', path: '/1' },
    { id: 2, label: '코 없는 코끼리 no.2', path: '/2' },
    { id: 3, label: '들리지 않는 속삭임-33번의 흔들림', path: '/3' },
    { id: 4, label: '궤도(토토포노로지 #4)', path: '/4' },
    { id: 5, label: '녹는점', path: '/5' },
    { id: 6, label: '소셜 댄스', path: '/6' },
    { id: 7, label: '아슬아슬', path: '/7' },
    { id: 8, label: '안녕히 엉키기', path: '/8' },
  ];

  useEffect(() => {
    let lastUpdate = 0;
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let shakeCount = 0;
    let lastShake = 0;

    const handleMotion = (event) => {
      const now = Date.now();
      if (now - lastUpdate < 50) return; // 50ms 간격으로 업데이트
      lastUpdate = now;

      const { x, y, z } = event.accelerationIncludingGravity;
      const speed = Math.sqrt(x * x + y * y + z * z);
      
      setShakeSpeed(speed);
      setDebugInfo(prev => `흔들기 속도: ${speed.toFixed(2)} | 횟수: ${shakeCount}`);
      
      // 흔들기 감지
      if (speed > 10) {
        const currentTime = new Date().getTime();
        if (currentTime - lastShake > 1000) {
          lastShake = currentTime;
          shakeCount++;
          setDebugInfo(prev => `흔들기 감지! 속도: ${speed.toFixed(2)} | 횟수: ${shakeCount}`);
          
          if (shakeCount >= 2) {
            setDebugInfo(prev => '메뉴 표시 트리거!');
            onClose(false);
            shakeCount = 0;
          }
        }
      }
    };

    const handleOrientation = (event) => {
      const now = Date.now();
      if (now - lastUpdate < 50) return;
      lastUpdate = now;

      const { alpha, beta, gamma } = event;
      const speed = Math.sqrt(
        Math.pow(alpha - lastX, 2) + 
        Math.pow(beta - lastY, 2) + 
        Math.pow(gamma - lastZ, 2)
      );
      
      lastX = alpha;
      lastY = beta;
      lastZ = gamma;
      
      setShakeSpeed(speed);
      setDebugInfo(prev => `회전 속도: ${speed.toFixed(2)} | 횟수: ${shakeCount}`);
      
      if (speed > 10) {
        const currentTime = new Date().getTime();
        if (currentTime - lastShake > 1000) {
          lastShake = currentTime;
          shakeCount++;
          setDebugInfo(prev => `회전 감지! 속도: ${speed.toFixed(2)} | 횟수: ${shakeCount}`);
          
          if (shakeCount >= 2) {
            setDebugInfo(prev => '메뉴 표시 트리거!');
            onClose(false);
            shakeCount = 0;
          }
        }
      }
    };

    // iOS에서 DeviceMotionEvent 권한 요청
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permission => {
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            window.addEventListener('deviceorientation', handleOrientation);
            setDebugInfo(prev => '모션/방향 감지 권한 허용됨');
          } else {
            setDebugInfo(prev => '모션/방향 감지 권한 거부됨');
          }
        })
        .catch(error => {
          setDebugInfo(prev => '권한 요청 실패: ' + error.message);
        });
    } else {
      window.addEventListener('devicemotion', handleMotion);
      window.addEventListener('deviceorientation', handleOrientation);
      setDebugInfo(prev => '모션/방향 감지 이벤트 리스너 등록됨');
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [onClose]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">메뉴</h2>
            <button
              onClick={() => onClose(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>디버그 모드</span>
              <button
                onClick={() => setIsDebugMode(!isDebugMode)}
                className={`px-4 py-2 rounded ${
                  isDebugMode ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {isDebugMode ? '켜짐' : '꺼짐'}
              </button>
            </div>
            
            {isDebugMode && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <div className="font-bold mb-2">디버그 정보:</div>
                <div>흔들기 속도: {shakeSpeed.toFixed(2)}</div>
                <div>마지막 흔들기: {lastShakeTime ? new Date(lastShakeTime).toLocaleTimeString() : '없음'}</div>
                <div className="mt-2">{debugInfo}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu; 