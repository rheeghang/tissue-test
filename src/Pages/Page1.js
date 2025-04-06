import React, { useState, useEffect } from 'react';
import { useGuide } from '../contexts/GuideContext';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import { useLanguage } from '../contexts/LanguageContext';

const Page1 = () => {
  const { language } = useLanguage();
  const data = language === 'ko' ? koData : enData;
  const { title, artist, caption, body } = data.page1;
  const { showGuideMessage } = useGuide();
  
  // 블러 이펙트를 위한 상태 추가
  const [blurAmount, setBlurAmount] = useState(0);
  const [currentBeta, setCurrentBeta] = useState(0);
  const [currentGamma, setCurrentGamma] = useState(0);
  
  const tolerance = 20;  // 허용 범위 ±30
  const targetBeta = -10;  // 목표 베타값
  const targetGamma = -31;  // 목표 감마값
  const [outOfRangeStartTime, setOutOfRangeStartTime] = useState(null);

  // 디바이스 방향 감지 및 블러 계산
  useEffect(() => {
    const handleOrientation = (event) => {
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;
      
      setCurrentBeta(beta);
      setCurrentGamma(gamma);
      
      // 베타와 감마의 목표값과의 차이 계산
      const betaDifference = Math.abs(beta - targetBeta);
      const gammaDifference = Math.abs(gamma - targetGamma);
      
      // 두 각도 모두 허용 범위 내에 있을 때만 블러 제거
      if (betaDifference <= tolerance && gammaDifference <= tolerance) {
        setBlurAmount(0);
      } else {
        // 더 큰 차이값을 기준으로 블러 계산
        const maxDifference = Math.max(betaDifference, gammaDifference);
        const blur = Math.min(20, (maxDifference - tolerance) / 3);
        setBlurAmount(blur);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // 가이드 메시지 표시 로직 수정
  useEffect(() => {
    const now = Date.now();
    const betaDifference = Math.abs(currentBeta - targetBeta);
    const gammaDifference = Math.abs(currentGamma - targetGamma);
    const isOutOfRange = betaDifference > tolerance || gammaDifference > tolerance;
    
    if (isOutOfRange) {
      if (!outOfRangeStartTime) {
        setOutOfRangeStartTime(now);
      } else if (now - outOfRangeStartTime >= 4000) {
        showGuideMessage();
      }
    } else {
      setOutOfRangeStartTime(null);
    }
  }, [currentBeta, currentGamma, outOfRangeStartTime, showGuideMessage]);

  // 다국어 처리를 위한 안내 메시지
  const guideMessage = language === 'ko' 
    ? "다음 작품으로 이동하려면 흔들어주세요."
    : "Shake it to move to the next part";

  return (
    <div className="min-h-screen bg-black fixed w-full">
      <div className="outer-container rotate-[105deg] top-[-20vh] relative w-[95%] h-[140vh] items-center justify-center"
        style={{
          filter: `blur(${blurAmount}px)`, 
          transition: 'filter 0.3s ease'
        }}
      >
        <div 
          className="container h-[130vh] overflow-y-auto overflow-x-hidden"
          style={{
            transform: 'translateZ(0)',
            maxHeight: '120vh',
            overflowY: 'auto',
            WebkitScrollbar: 'none',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <div 
            className='container p-8 mt-[53vh] bg-page1-bg text-page1-text text-stroke-white-thin mb-[100vh] relative w-[100%]'
          >
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold mb-4">{title}</h1>
              <p className="text-base mb-2">{artist}</p>
              <p className="text-xs" dangerouslySetInnerHTML={{ __html: caption }} />
            </div>
            
            <div 
              className="text-base leading-relaxed break-keep"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>
      </div>
      <div className="fixed top-3 right-10 left-10 items-center justify-center p-1 bg-white/50 text-black text-center text-sm">
        {guideMessage}
      </div>
      
      {/* 디버깅을 위한 각도 표시 */}
      <div className="fixed top-2 left-0 right-0 text-center z-10 flex justify-center space-x-4">
        <p className="text-xl font-bold text-white">β: {Math.round(currentBeta)}°</p>
        <p className="text-xl font-bold text-white">γ: {Math.round(currentGamma)}°</p>
        <p className="text-xl font-bold text-white">blur: {Math.round(blurAmount)}</p>
      </div>
    </div>
  );
};

export default Page1;