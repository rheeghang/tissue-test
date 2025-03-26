import React, { useState, useEffect } from 'react';

const Menu = ({ isOpen, onClose, onShake }) => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [shakeSpeed, setShakeSpeed] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('대기중');

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

  // 흔들기 감지 로직
  useEffect(() => {
    let lastUpdate = 0;
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;

    const handleMotion = (event) => {
      const now = Date.now();
      if (now - lastUpdate < 50) return;
      lastUpdate = now;

      const { x, y, z } = event.accelerationIncludingGravity;
      const speed = Math.sqrt(x * x + y * y + z * z);
      
      setShakeSpeed(speed);
      setDebugInfo(prev => `흔들기 속도: ${speed.toFixed(2)} | 횟수: ${shakeCount}`);
      
      if (speed > 30) {
        const currentTime = new Date().getTime();
        if (currentTime - lastShakeTime > 1000) {
          setLastShakeTime(currentTime);
          setShakeCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 2) {
              onShake(true);
              return 0;
            }
            return newCount;
          });
        }
      }
    };

    // iOS 권한 요청
    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          setPermissionStatus('권한 요청 중...');
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            setPermissionStatus('권한 허용됨');
            window.addEventListener('devicemotion', handleMotion);
          } else {
            setPermissionStatus('권한 거부됨');
          }
        } catch (error) {
          setPermissionStatus('권한 요청 실패: ' + error.message);
        }
      } else {
        setPermissionStatus('일반 브라우저');
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [shakeCount, lastShakeTime, onShake]);

  // 메뉴 아이템 클릭 핸들러 추가
  const handleMenuItemClick = (path) => {
    window.location.href = path;
    onClose(true);
  };

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
                <div>흔들기 횟수: {shakeCount}</div>
                <div>마지막 흔들기: {lastShakeTime ? new Date(lastShakeTime).toLocaleTimeString() : '없음'}</div>
                <div>권한 상태: {permissionStatus}</div>
                <div className="mt-2">{debugInfo}</div>
              </div>
            )}
          </div>

          {/* 메뉴 아이템 목록 추가 */}
          <div className="mt-4 space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.path)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu; 