import React, { useState, useEffect } from 'react';
import { useBlurEffect } from '../hooks/useBlurEffect';
import { useGuide } from '../contexts/GuideContext';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';
import { useLanguage } from '../contexts/LanguageContext';

const Page7 = () => {
  const { language } = useLanguage();
  const data = language === 'ko' ? koData : enData;
  const { title, artist, caption, body } = data.page7;
  const targetAlpha = 295;  // 225도 회전
  const { blurAmount, currentAlpha, tolerance } = useBlurEffect(targetAlpha);
  const { showGuideMessage } = useGuide();
  const [outOfRangeStartTime, setOutOfRangeStartTime] = useState(null);
  const guideMessage = language === 'ko' 
  ? "다음 작품으로 이동하려면 흔들어주세요."
  : "Shake it to move to the next part";

  useEffect(() => {
    const now = Date.now();
    const isOutOfRange = Math.abs(currentAlpha - targetAlpha) > tolerance;
    
    if (isOutOfRange) {
      if (!outOfRangeStartTime) {
        setOutOfRangeStartTime(now);
      }
    } else {
      setOutOfRangeStartTime(null);
    }
  }, [currentAlpha, tolerance, outOfRangeStartTime, showGuideMessage]);

  return (
    <div className="min-h-screen bg-black fixed w-full">
      <div className="outer-container rotate-[295deg] top-[-30vh] relative w-[95%] h-[150vh] items-center justify-center"
        style={{
          filter: `blur(${blurAmount}px)`, 
          transition: 'filter 0.3s ease'
        }}
      >
        <div 
          className="container h-[150vh] overflow-y-auto overflow-x-hidden"
          style={{
            transform: 'translateZ(0)',
            maxHeight: '140vh',
            overflowY: 'auto',
            WebkitScrollbar: 'none',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <div 
            className='container p-8 mt-[65vh] bg-page7-bg text-page7-text text-stroke-thin mb-[100vh] relative w-[100%]'
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
    </div>
  );
};

export default Page7; 