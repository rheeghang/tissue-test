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
  const [currentAlpha, setCurrentAlpha] = useState(0);
  const tolerance = 17;
  const targetAlpha = 105;
  const targetBeta = 10;
  const targetGamma = 10;
  const [outOfRangeStartTime, setOutOfRangeStartTime] = useState(null);

  // 디바이스 방향 감지 및 블러 계산
  useEffect(() => {
    const handleOrientation = (event) => {
      const alpha = event.alpha || 0;
      setCurrentAlpha(alpha);
      
      // 타겟 각도와의 차이 계산
      const difference = Math.abs(alpha - targetAlpha);
      
      // 블러 양 계산
      if (difference <= tolerance) {
        setBlurAmount(0);
      } else {
        // 차이가 클수록 블러가 강해지도록 계산
        const blur = Math.min(20, (difference - tolerance) / 3);
        setBlurAmount(blur);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // 가이드 메시지 표시 로직
  useEffect(() => {
    const now = Date.now();
    const isOutOfRange = Math.abs(currentAlpha - targetAlpha) > tolerance;
    
    if (isOutOfRange) {
      if (!outOfRangeStartTime) {
        setOutOfRangeStartTime(now);
      } else if (now - outOfRangeStartTime >= 4000) {
        showGuideMessage();
      }
    } else {
      setOutOfRangeStartTime(null);
    }
  }, [currentAlpha, outOfRangeStartTime, showGuideMessage]);

  // 다국어 처리를 위한 안내 메시지
  const guideMessage = language === 'ko' 
    ? "다음 작품으로 이동하려면 흔들어주세요."
    : "Shake it to move to the next part";

  return (
    <div className="min-h-screen bg-black fixed w-full">
      <div className="outer-container rotate-[105deg] top-[-20vh] relative w-[95%] h-[140vh] items-center justify-center"
        // style={{
        //   filter: `blur(${blurAmount}px)`, 
        //   transition: 'filter 0.3s ease'
        // }}
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
      
      {/* 디버깅을 위한 각도 표시 (필요시 주석 해제) */}
      {/* <div className="fixed top-2 left-0 right-0 text-center z-10">
        <p className="text-xl font-bold text-white">α: {Math.round(currentAlpha)}°</p>
        <p className="text-xl font-bold text-white">blur: {Math.round(blurAmount)}</p>
      </div> */}
    </div>
  );
};

export default Page1;