import React, { useState, useEffect, useRef } from 'react';
import RotatedText from './RotatedText';

const ExhibitionText = () => {
  const [blurAmount, setBlurAmount] = useState(10);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const audioRef = useRef(null);
  const fadeInterval = useRef(null);
  const audioPlayed = useRef(false); // 오디오 페이드 인/아웃 여부
  const textReadPlayed = useRef(false); // 보이스오버 실행 여부
  const userInteracted = useRef(false); // 사용자가 터치했는지 여부

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  // 목표 각도 및 허용 범위 설정
  const targetBeta = 45;
  const targetGamma = -60;
  const tolerance = 10;
  const maxBlur = 10;

  const title = "우리의 몸에는 타인이 깃든다";
  const originalText = `2025 ACC 접근성 강화 주제전 《우리의 몸에는 타인이 깃든다》는 '경계 넘기'를 주제로 존재의 '다름'을 인정할 뿐만 아니라 나와 다른 존재에 취해야 할 태도에 대해 고민하는 전시입니다.`;

  // 🔹 사용자 터치 이벤트 핸들러 (첫 터치 시 사운드 활성화)
  const handleUserInteraction = () => {
    if (audioRef.current && !userInteracted.current) {
      audioRef.current.play()
        .then(() => {
          userInteracted.current = true;
          console.log("🔊 사용자 터치 감지: 오디오 재생 시작");
        })
        .catch(err => console.log("오디오 재생 실패:", err));

      // 한 번 터치 후 이벤트 리스너 제거 (불필요한 추가 호출 방지)
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
    }
  };

  // 🔹 오디오 페이드 인 (부드럽게 증가)
  const fadeInAudio = () => {
    if (audioRef.current && userInteracted.current) {
      clearInterval(fadeInterval.current);
      audioRef.current.volume = 0;
      audioRef.current.play();
      let volume = 0;
      fadeInterval.current = setInterval(() => {
        if (volume < 1) {
          volume = Math.min(volume + 0.05, 1);
          audioRef.current.volume = volume;
        } else {
          clearInterval(fadeInterval.current);
        }
      }, 100);
    }
  };

  // 🔹 오디오 페이드 아웃 (부드럽게 감소)
  const fadeOutAudio = () => {
    if (audioRef.current && userInteracted.current) {
      clearInterval(fadeInterval.current);
      let volume = audioRef.current.volume;
      fadeInterval.current = setInterval(() => {
        if (volume > 0) {
          volume = Math.max(volume - 0.05, 0);
          audioRef.current.volume = volume;
        } else {
          clearInterval(fadeInterval.current);
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }, 100);
    }
  };

  // 🔹 보이스오버 읽기 기능 (중복 방지)
  const speakText = (text) => {
    if (textReadPlayed.current) return;
    window.speechSynthesis.cancel(); // 기존 보이스오버 정지
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
    textReadPlayed.current = true;
  };

  // 🔹 방향 감지 이벤트 핸들러
  const handleOrientation = (event) => {
    const { beta, gamma } = event;
    const betaDiff = Math.abs(beta - targetBeta);
    const gammaDiff = Math.abs(gamma - targetGamma);
    
    if (betaDiff <= tolerance && gammaDiff <= tolerance) {
      setBlurAmount(0);
      fadeOutAudio();
      if (!textReadPlayed.current) {
        speakText(originalText);
      }
      audioPlayed.current = false;
    } else {
      const blur = Math.min(maxBlur, Math.max(betaDiff, gammaDiff) / 5);
      setBlurAmount(blur);

      if (!audioPlayed.current) {
        fadeInAudio();
        audioPlayed.current = true;
      }
    }
  };

  // 🔹 iOS 권한 요청
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } catch (error) {
        console.error('Error requesting permission:', error);
      }
    } else {
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  useEffect(() => {
    if (window.DeviceOrientationEvent) {
      if (isIOS) {
        requestPermission();
      } else {
        setPermissionGranted(true);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      clearInterval(fadeInterval.current);
    };
  }, []);

  // 🔹 사용자가 터치하면 오디오 재생을 활성화하는 이벤트 추가
  useEffect(() => {
    window.addEventListener('touchstart', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);

    return () => {
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-exhibition-bg overflow-hidden">
      {!permissionGranted && isIOS ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-black">
            <h2 className="text-xl font-bold mb-4">권한 요청</h2>
            <p className="mb-4">기기 방향 감지 권한을 허용해 주세요.</p>
            <button
              onClick={requestPermission}
              className="bg-exhibition-bg text-exhibition-text px-4 py-2 rounded hover:opacity-90 transition-opacity"
            >
              권한 허용하기
            </button>
          </div>
        </div>
      ) : (
        <>
          <RotatedText text={originalText} title={title} blurAmount={blurAmount} />
          <audio ref={audioRef} src="/assets/sound.mp3" />
        </>
      )}
    </div>
  );
};

export default ExhibitionText;