import React, { useState, useEffect } from "react";
import koData from '../i18n/ko.json';
import { useNavigate } from 'react-router-dom';
import { useBlurEffect } from '../hooks/useBlurEffect';

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
      <div className="relative z-50 w-80 rounded-lg bg-white p-6 shadow-xl">
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

const Home1 = ({ onStartClick }) => {
  const [alpha, setAlpha] = useState(0);
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("cyan"); // 기본 배경색
  const [showModal, setShowModal] = useState(true);
  const [showControls, setShowControls] = useState(false); // 추가: 컨트롤 표시 상태
  const [showStartButton, setShowStartButton] = useState(false); // 수정: 시작하기 버튼 표시 상태
  const { title, subtitle } = koData.home1;
  const navigate = useNavigate();
  const targetAlpha = 0;
  const { blurAmount, currentAlpha } = useBlurEffect(targetAlpha);

  const roundTo15Degrees = (angle) => {
    return Math.round(angle / 15) * 15;
  };

  // 랜덤 색상 생성 함수
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

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

  useEffect(() => {
    const handleOrientation = (event) => {
      setAlpha(event.alpha); // Z축 회전 (Yaw)
      setBeta(event.beta);   // X축 기울기 (Pitch)
      setGamma(event.gamma); // Y축 기울기 (Roll)

      // 뒤집힌 경우 (베타가 +90도 또는 -90도에 가까운 경우) - 색상 변경
      if (Math.abs(event.beta) > 80) {
        setBackgroundColor(getRandomColor());
      }
    };

    if (permissionGranted) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [permissionGranted]);

  // 수정: 시작하기 버튼만 3초 후 페이드 인
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStartButton(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white p-4">
      <Modal 
        isOpen={!permissionGranted && showModal}
        onClose={() => setShowModal(false)}
        onConfirm={requestPermission}
      />

      <div className="items-center min-h-screen space-y-2 text-center z-10 text-gray-800">
        <h1 className="text-sm leading-relaxed font-bold mb-4 font-medium">
            {title}</h1>
        <div className="items-center space-y-2 text-center z-11 font-bold text-black">
        <p className="text-xl font-medium text-gray-800">Z(α): {roundTo15Degrees(alpha)}°</p>
        <p className="text-xl font-medium text-gray-800">X(β): {roundTo15Degrees(beta)}°</p>
        <p className="text-xl font-medium text-gray-800">Y(γ): {roundTo15Degrees(gamma)}°</p>
      </div>
      </div>
      

      {/* 회전하는 박스 */}
      <div className="fixed inset-0 flex items-center justify-center z-0">
        <div
          style={{
            backgroundColor: backgroundColor,
            transition: "all 0.3s ease",
            transform: `rotate(${alpha}deg)`,
            width: '250px',
            height: '250px',
            borderRadius: Math.abs(gamma) >= 90 ? '50%' : '0%'
          }}
        />
      </div>

      {/* 시작하기 버튼과 언어 선택 */}
      <div className="fixed bottom-3 left-0 right-0 flex flex-col items-center space-y-3">
        <div className="text-lg font-bold text-black">
          <span className="cursor-pointer">Ko</span>
          <span className="mx-2">|</span>
          <span className="cursor-pointer">En</span>
        </div>
        <button 
          onClick={() => navigate('/tutorial1')}
          className={`w-48 bg-black px-6 py-4 text-xl font-bold text-white shadow-lg transition-opacity duration-[2000ms] hover:bg-gray-800 ${
            showStartButton ? 'opacity-100' : 'opacity-0'
          }`}
        >
          시작하기
        </button>
      </div>
    </div>
  );
};

export default Home1;