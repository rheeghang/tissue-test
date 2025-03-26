import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';

const Menu = ({ isOpen, onClose }) => {
  const [isAngleMode, setIsAngleMode] = useState(false);
  const [isShakeDetected, setIsShakeDetected] = useState(false);

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
    const SHAKE_THRESHOLD = 15; // 흔들기 감지 임계값

    const handleMotion = (event) => {
      const current = event.timeStamp || new Date().getTime();
      if ((current - lastUpdate) > 100) { // 100ms 간격으로 체크
        const diffTime = current - lastUpdate;
        lastUpdate = current;

        const x = event.acceleration.x;
        const y = event.acceleration.y;
        const z = event.acceleration.z;

        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
        
        if (speed > SHAKE_THRESHOLD) {
          setIsShakeDetected(true);
          // 3초 후에 자동으로 메뉴 닫기
          setTimeout(() => {
            setIsShakeDetected(false);
            onClose();
          }, 3000);
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    // 이미 권한이 허용된 상태이므로 바로 이벤트 리스너 등록
    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
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