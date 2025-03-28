import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

const Modal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* 모달 컨텐츠 */}
      <div className="relative z-50 w-80 rounded-lg bg-white p-6 shadow-xl text-center">
        <h3 className="mb-4 text-xl font-bold text-gray-900">센서 권한 요청</h3>
        <p className="mb-6 text-gray-600">
          기기 방향 감지 센서 권한이 필요합니다.
        </p>
        <button
          onClick={onConfirm}
          className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
        >
          허용
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [alpha, setAlpha] = useState(0);
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const [blurAmounts, setBlurAmounts] = useState([10, 10, 10]);
  
  const boxAngles = [0, 35, 330]; // 각 박스의 회전 각도
  const tolerance = 15; // 허용 범위 ±30도
  const maxBlur = 8; // 최대 블러값

  const SHAKE_THRESHOLD = 30;
  const SHAKE_INTERVAL = 1000;
  let lastShakeTime = 0;

  const requestPermission = () => {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === "granted") {
            console.log("Permission granted!");
            setPermissionGranted(true);
            setShowModal(false);
          }
        })
        .catch(console.error);
    } else {
      setPermissionGranted(true);
      setShowModal(false);
    }
  };

  const handleOrientation = useCallback((event) => {
    if (event.alpha !== null) {
      setCurrentAlpha(event.alpha);
      
      // 각 박스별로 블러 계산
      const newBlurAmounts = boxAngles.map((targetAngle, index) => {
        let angleDiff;
        
        if (index === 0) {
          const diff1 = Math.abs(event.alpha - 0);
          const diff2 = Math.abs(event.alpha - 360);
          angleDiff = Math.min(diff1, diff2);
        } else {
          angleDiff = Math.abs(event.alpha - targetAngle);
        }

        if (angleDiff <= tolerance) {
          return 0;
        }
        return Math.min(maxBlur, (angleDiff / 60) * maxBlur);
      });
      
      setBlurAmounts(newBlurAmounts);
    }
  }, []);

  const handleMotion = (event) => {
    const now = Date.now();
    if (now - lastShakeTime < SHAKE_INTERVAL) return;

    const { acceleration } = event;
    if (!acceleration) return;

    const shakeStrength =
      Math.abs(acceleration.x) +
      Math.abs(acceleration.y) +
      Math.abs(acceleration.z);

    if (shakeStrength > SHAKE_THRESHOLD) {
      setMenuVisible(true);
      lastShakeTime = now;

      setTimeout(() => {
        setMenuVisible(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const handleOrientation = (event) => {
      setAlpha(event.alpha); // Z축 회전 (Yaw)
      setBeta(event.beta);   // X축 기울기 (Pitch)
      setGamma(event.gamma); // Y축 기울기 (Roll)
    };

    if (permissionGranted) {
      window.addEventListener("deviceorientation", handleOrientation);
      window.addEventListener("devicemotion", handleMotion);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [permissionGranted]);

  useEffect(() => {
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <Modal 
        isOpen={!permissionGranted && showModal}
        onClose={() => setShowModal(false)}
        onConfirm={requestPermission}
      />

      <div className="fixed top-2 left-0 right-0 space-y-1 text-center z-10">
        <p className="text-xl font-medium text-gray-800">{Math.round(alpha)}°</p>
      </div>

      {/* 3개의 고정 회전 텍스트 박스 */}
      <div className="fixed inset-0 flex flex-col -mt-16 items-center justify-center gap-12 z-0">
        <div className="absolute left-1 top-[30%] z-10">
          <p className="text-sm text-gray-400 font-medium">0°</p>
        </div>
        <div
          style={{
            transform: 'rotate(0deg)',
            filter: `blur(${blurAmounts[0]}px)`,
            transition: 'filter 0.3s ease',
            zIndex: 10
          }}
          className="w-80 p-4 bg-white shadow-lg relative"
        >
          <p className="text-lg leading-relaxed text-gray-800 break-keep">
            국립아시아문화전당은 티슈오피스와 함께 다양한 관점으로 전시를 감상하는 도슨팅 모바일 웹을 개발했습니다.
          </p>
        </div>

        <div className="absolute left-1 top-[50%] z-10">
          <p className="text-sm text-gray-400 font-medium">35°</p>
        </div>
        <div
          style={{
            transform: 'rotate(35deg)',
            filter: `blur(${blurAmounts[1]}px)`,
            transition: 'filter 0.3s ease'
          }}
          className="w-80 p-4 bg-white shadow-lg"
        >
          <p className="text-lg leading-relaxed text-gray-800 break-keep">
            큐레이터의 해설을 명쾌하고 매끄럽고 깔끔하고 편리하게 전달하는 보편적인 도슨트 기능에서 벗어나 조금은 번거럽고 비생산적이며 낯설지만,
          </p>
        </div>

        <div className="absolute left-1 top-[70%] z-10">
          <p className="text-sm text-gray-400 font-medium">330°</p>
        </div>
        <div
          style={{
            transform: 'rotate(-15deg)',
            filter: `blur(${blurAmounts[2]}px)`,
            transition: 'filter 0.3s ease'
          }}
          className="w-80 p-4 bg-white shadow-lg"
        >
          <p className="text-lg leading-relaxed text-gray-800 break-keep">
            '각도'를 바꾸고 '관점'을 틀어 각자만의 방식으로 작품을 이해하는 시간을 가지고자 합니다.
          </p>
        </div>
      </div>

      {/* 시작하기 버튼 */}
      <div className="fixed bottom-3 left-0 right-0 flex justify-center">
        <button 
          onClick={() => navigate('/intro')}
          className="w-48 bg-black px-6 py-4 text-xl font-bold text-white shadow-lg transition-colors hover:bg-gray-800"
        >
          시작하기
        </button>
      </div>
    </div>
  );
};

export default Home;