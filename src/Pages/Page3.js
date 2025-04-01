import React, { useState, useEffect } from 'react';
import { useBlurEffect } from '../hooks/useBlurEffect';
import { useGuide } from '../contexts/GuideContext';
import koData from '../i18n/ko.json';

const Page3 = () => {
  const { title, artist, caption, body } = koData.page3;
  const { blurAmount, currentAlpha, tolerance } = useBlurEffect(45);
  const { showGuideMessage } = useGuide();
  const [outOfRangeStartTime, setOutOfRangeStartTime] = useState(null);

  useEffect(() => {
    const now = Date.now();
    const isOutOfRange = Math.abs(currentAlpha - 45) > tolerance;
    
    if (isOutOfRange) {
      if (!outOfRangeStartTime) {
        setOutOfRangeStartTime(now);
      } else if (now - outOfRangeStartTime >= 4000) {
        showGuideMessage();
      }
    } else {
      setOutOfRangeStartTime(null);
    }
  }, [currentAlpha, tolerance, outOfRangeStartTime, showGuideMessage]);

  return (
    <div className="min-h-screen bg-black fixed w-full">
      <div className="outer-container rotate-[45deg] text-black relative w-[95%] h-[140vh] items-center justify-center"
        style={{
          filter: `blur(${blurAmount}px)`, 
          transition: 'filter 0.3s ease'
        }}
      >
        <div 
          className="container h-[150vh] max-w-2xl overflow-y-auto overflow-x-hidden"
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
            className='container p-5 mt-[55vh] bg-cyan-500 mb-[100vh] relative w-[100%]'
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
      <div className="fixed top-3 right-10 left-10 items-center justify-center p-1 bg-white/50 text-black text-center text-sm">다음 작품으로 이동하려면 흔들어주세요.</div>
    </div>
  );
};

export default Page3;