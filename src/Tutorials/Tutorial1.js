import React from "react";
import { useNavigate } from 'react-router-dom';
import { useBlurEffect } from '../hooks/useBlurEffect';


const Tutorial1 = () => {
  const navigate = useNavigate();
  const targetAlpha = 20; // 목표 각도
  const { blurAmount, currentAlpha } = useBlurEffect(30);

  return (

    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed top-2 left-0 right-0 space-y-1 text-center z-10">
        <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
      </div>

      {/* 회전 텍스트 박스 */}
      <div className="fixed left-1/2 top-[20vh] -translate-x-1/2 z-0 rotate-[20deg]">
        <div
          style={{
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease',
          }}
          className="w-80 p-4 bg-gray-200 shadow-lg relative"
        >
          <p className="text-lg leading-relaxed text-gray-800 break-keep mb-8">
            국립아시아문화전당은 티슈오피스와 함께 다양한 관점으로 전시를 감상하는 도슨팅 모바일 웹을 개발했습니다.
          </p>
          
          {/* 화살표 버튼 */}
          <div 
            className="absolute bottom-2 right-2 cursor-pointer"
            onClick={() => navigate('/tutorial2')}
          >
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none"  // 박스 회전을 상쇄하기 위한 역회전
            >
              <path 
                d="M5 12H19M19 12L12 5M19 12L12 19" 
                stroke="#FF5218" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial1; 