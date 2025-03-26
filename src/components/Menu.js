import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';

const Menu = ({ isOpen, onClose }) => {
  const [isAngleMode, setIsAngleMode] = useState(false);
  const [isShakeDetected, setIsShakeDetected] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [shakeSpeed, setShakeSpeed] = useState(0);
  const [lastShakeTime, setLastShakeTime] = useState(0);

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
      
      // 흔들기 감지
      if (speed > 10) { // 임계값을 10으로 낮춤
        const currentTime = new Date().getTime();
        if (currentTime - lastShake > 1000) { // 1초 간격으로 체크
          lastShake = currentTime;
          shakeCount++;
          console.log('흔들기 감지:', speed, '횟수:', shakeCount);
          
          if (shakeCount >= 2) { // 2번 이상 흔들면 메뉴 표시
            console.log('메뉴 표시 트리거');
            onClose(false); // 메뉴 열기
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
      
      if (speed > 10) {
        const currentTime = new Date().getTime();
        if (currentTime - lastShake > 1000) {
          lastShake = currentTime;
          shakeCount++;
          console.log('회전 감지:', speed, '횟수:', shakeCount);
          
          if (shakeCount >= 2) {
            console.log('메뉴 표시 트리거');
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
            console.log('모션/방향 감지 권한 허용됨');
          } else {
            console.log('모션/방향 감지 권한 거부됨');
          }
        })
        .catch(error => {
          console.error('권한 요청 실패:', error);
        });
    } else {
      window.addEventListener('devicemotion', handleMotion);
      window.addEventListener('deviceorientation', handleOrientation);
      console.log('모션/방향 감지 이벤트 리스너 등록됨');
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [onClose]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-600 ${(isOpen || isShakeDetected) ? 'opacity-200' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed top-5 left-5 right-5 bottom-5 max-w-[400px] mx-auto bg-white shadow-lg transform transition-transform duration-300 ${(isOpen || isShakeDetected) ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-3xl mx-auto p-2 text-center h-[calc(100vh-20px)] flex flex-col">
          <div className="flex justify-center mb-2">
            <button
              onClick={() => {
                setIsShakeDetected(false);
                onClose();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              [닫기]
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <nav>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id} className="px-5">
                    <a
                      href={item.path}
                      className="block px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200 border-2 border-black"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="pb-7">
            <ToggleSwitch 
              isOn={isAngleMode} 
              onToggle={() => setIsAngleMode(!isAngleMode)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu; 