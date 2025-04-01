import React from "react";
import { useNavigate } from 'react-router-dom';
import { useBlurEffect } from '../hooks/useBlurEffect';

const Tutorial3 = () => {
  const navigate = useNavigate();
  const targetAlpha = 120; // 목표 각도
  const { blurAmount, currentAlpha } = useBlurEffect(30);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed top-2 left-0 right-0 space-y-1 text-center z-10">
        <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
      </div>

      {/* 회전 텍스트 박스 */}
      <div className="fixed left-1/2 top-[50vh] -translate-x-1/2 z-0 rotate-[120deg]">
        <div
          style={{
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease',
          }}
          className="w-80 p-4 bg-key-color shadow-lg relative"
        >
          <p className="text-lg text-white leading-relaxed text-gray-800 break-keep mb-8">
            '각도'를 바꾸고 '관점'을 틀어 각자만의 방식으로 작품을 이해하는 시간을 가지고자 합니다.
          </p>
          
          <div className="mt-14">
          {/* 이전 페이지 화살표 (좌측) */}
          <div 
            className="absolute bottom-2 left-2 cursor-pointer"
            onClick={() => navigate('/tutorial2')}
          >
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none"
              className="stroke-gray-200 rotate-180"
            >
              <path 
                d="M5 12H19M19 12L12 5M19 12L12 19" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          </div>
        </div>
        
      </div>
      <div className="fixed top-[20vh] rotate-[120deg] right-10 left-10 items-center justify-center p-1 bg-white/80 text-black text-center text-sm font-medium
      "style={{
        filter: `blur(${blurAmount}px)`,
        transition: 'filter 0.3s ease',
      }}>
        흔들면 메뉴가 나옵니다.
      </div>
    </div>
  );
};

export default Tutorial3; 