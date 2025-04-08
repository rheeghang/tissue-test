import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';

const Modal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const modalMessage = "작품 감상을 위해 기기의 방향 감지 센서 사용이 필요합니다 ";
  const buttonText = "허용 후 계속하기";

  if (!isMobile) return null;

  let isProcessing = false;

  const handlePermissionRequest = async (e) => {
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          onConfirm();
        }
      } else {
        onConfirm();
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 transition-opacity pointer-events-none" />
      <div className="relative z-[101] w-80 rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-xl font-bold text-gray-900 select-none">
          센서 권한을 허용해 주세요
        </h3>
        <p className="mb-6 text-gray-600 select-none">
          {modalMessage}
        </p>
        <button
          onClick={handlePermissionRequest}
          onTouchStart={(e) => {
            e.stopPropagation();
            handlePermissionRequest();
          }}
          className="w-full rounded-md bg-black px-4 py-2 text-white transition-colors active:bg-gray-800"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const LanguageSelector = ({ language, onLanguageChange }) => {
  const handleLanguageSelect = (lang, e) => {
    e.preventDefault();
    e.stopPropagation();
    onLanguageChange(lang);
  };

  return (
    <div className="fixed bottom-[15vh] left-0 right-0 flex justify-center">
    <div className="text-xl font-bold text-black">
      <button 
        onClick={(e) => handleLanguageSelect('ko', e)}
        onTouchStart={(e) => handleLanguageSelect('ko', e)}
        className={`px-3 py-2 ${language === 'ko' ? 'text-black' : 'text-gray-400'}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label={language === 'ko' ? "한국어 선택됨" : "한국어로 변경"}
      >
        Ko
      </button>
      <span className="mx-2" aria-hidden="true">|</span>
      <button 
        onClick={(e) => handleLanguageSelect('en', e)}
        onTouchStart={(e) => handleLanguageSelect('en', e)}
        className={`px-3 py-2 ${language === 'en' ? 'text-black' : 'text-gray-400'}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label={language === 'en' ? "English selected" : "Change to English"}
      >
        En
      </button>
    </div>
    </div>
  );
};

const Home = () => {
  const [alpha, setAlpha] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [startButtonOpacity, setStartButtonOpacity] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const data = language === 'ko' ? koData : enData;

  const isIOS = () => {
    return (
      ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
  };

  useEffect(() => {
    const handleOrientation = (event) => {
      setAlpha(prevAlpha => {
        const newAlpha = event.alpha || 0;
        return Math.round(newAlpha / 10) * 10;
      });
      setGamma(event.gamma || 0);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      if (isIOS()) {
        setShowModal(true);
      } else {
        setPermissionGranted(true);
        setShowModal(false);
      }
    } else {
      setPermissionGranted(true);
      setShowModal(false);
    }
  }, []);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowStartButton(true);
      setTimeout(() => {
        setStartButtonOpacity(1);
      }, 100);
    }, 6000);
    return () => clearTimeout(showTimer);
  }, []);

  const handleStart = () => {
    navigate('/tutorial/step/1');
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-4 relative flex flex-col">
        <Modal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setPermissionGranted(true);
            setShowModal(false);
          }}
        />

        <div className="fixed top-3 left-0 right-0 flex flex-col items-center space-y-2 text-center z-10">
          <h1 className="text-base leading-relaxed font-bold mb-4 font-medium whitespace-pre-line px-4">
            {data.home1.title}
          </h1>
          <div className="items-center space-y-2 text-center font-bold text-black">
            <p className="text-xl font-medium text-gray-800">{Math.round(alpha)}°</p>
          </div>
        </div>

        <div className="fixed inset-0 flex items-center justify-center z-0">
          <div
            style={{
              backgroundColor: "#FF5218",
              transition: "all 0.5s ease",
              transform: `rotate(${gamma}deg)`,
              width: '250px',
              height: '250px',
              borderRadius: (Math.abs(gamma) >= 40 && Math.abs(gamma) <= 70) || 
                           (Math.abs(gamma) >= 290 && Math.abs(gamma) <= 320) 
                           ? '125px' : '0px',
            }}
            className="shadow-lg"
          />
        </div>

        <div className="fixed bottom-3 left-0 right-0 flex flex-col items-center space-y-3">
          <button 
            onTouchStart={(e) => {
              e.preventDefault();
              handleStart();
            }}
            className="start-button w-48 bg-black px-6 py-4 text-xl font-bold text-white shadow-2xl"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              opacity: startButtonOpacity,
              transition: 'opacity 2s ease-in'
            }}
          >
            {data.home1.startButton}
          </button>
          
          <div className="mt-4">
            <LanguageSelector 
              language={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;