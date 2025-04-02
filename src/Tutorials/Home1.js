import React, { useState, useEffect } from "react";
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';  // 영문 데이터 import 추가
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
  const [boxColor, setBoxColor] = useState("#FF5218"); // 초기 박스 색상
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [showControls, setShowControls] = useState(false); // 추가: 컨트롤 표시 상태
  const [showStartButton, setShowStartButton] = useState(false);
  const [language, setLanguage] = useState('ko');  // 언어 상태 추가
  const navigate = useNavigate();
  const targetAlpha = 0;
  const { blurAmount, currentAlpha } = useBlurEffect(targetAlpha);

  // 현재 선택된 언어에 따라 데이터 선택
  const data = language === 'ko' ? koData : enData;
  const { title, subtitle } = data.home1;
  const startButtonText = language === 'ko' ? '시작하기' : 'Start';  // 시작하기 버튼 텍스트

  const roundTo15Degrees = (angle) => {
    return Math.round(angle / 15) * 15;
  };

  // 완전 랜덤 색상 생성 함수
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
      setAlpha(prevAlpha => {
        const newAlpha = event.alpha || 0;
        return prevAlpha + (newAlpha - prevAlpha) * 0.1;
      });
      setBeta(prevBeta => {
        const newBeta = event.beta || 0;
        return prevBeta + (newBeta - prevBeta) * 0.1;
      });
      setGamma(prevGamma => {
        const newGamma = event.gamma || 0;
        return prevGamma + (newGamma - prevGamma) * 0.1;
      });

      // 90도나 250도 회전 감지 시 완전 랜덤 색상으로 변경
      const currentAlpha = event.alpha || 0;
      if ((currentAlpha > 85 && currentAlpha < 95) || 
          (currentAlpha > 245 && currentAlpha < 255)) {
        setBoxColor(getRandomColor());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, []);

  // 수정: 시작하기 버튼만 7초 후 페이드 인
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStartButton(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  // 언어 변경 핸들러
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);  // 선택한 언어를 localStorage에 저장
  };

  // 컴포넌트 마운트 시 저장된 언어 설정 불러오기
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Modal 
        isOpen={!permissionGranted && showModal}
        onClose={() => setShowModal(false)}
        onConfirm={requestPermission}
      />

      <div className="items-center min-h-screen space-y-2 text-center z-10 text-gray-800">
        <h1 className="text-sm leading-relaxed font-bold mb-4 font-medium">
          {title}
        </h1>
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
            backgroundColor: boxColor,
            transition: "all 0.3s ease",
            transform: `rotate(${gamma}deg)`,  // 회전은 알파값 기준
            width: '250px',
            height: '250px',
            borderRadius: (gamma >= 55 && gamma <= 65) || 
                         (gamma >= -65 && gamma <= -55)
                         ? '50%' : '0%',  // 감마값 ±60도 부근에서 원으로 변경
          }}
          className="shadow-lg"
        />
      </div>

      {/* 시작하기 버튼과 언어 선택 수정 */}
      <div className="fixed bottom-3 left-0 right-0 flex flex-col items-center space-y-3">
        <div className="text-lg font-bold text-black">
          <span 
            className={`cursor-pointer ${language === 'ko' ? 'text-black' : 'text-gray-400'}`}
            onClick={() => handleLanguageChange('ko')}
          >
            Ko
          </span>
          <span className="mx-2">|</span>
          <span 
            className={`cursor-pointer ${language === 'en' ? 'text-black' : 'text-gray-400'}`}
            onClick={() => handleLanguageChange('en')}
          >
            En
          </span>
        </div>
        <button 
          onClick={() => navigate('/tutorial')}
          className={`w-48 bg-black px-6 py-4 text-xl font-bold text-white shadow-lg transition-opacity duration-[2000ms] hover:bg-gray-800 ${
            showStartButton ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {startButtonText}
        </button>
      </div>
    </div>
  );
};

export default Home1;