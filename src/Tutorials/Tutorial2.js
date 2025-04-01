import React from "react";
import { useNavigate } from 'react-router-dom';
import { useBlurEffect } from '../hooks/useBlurEffect';

const Tutorial2 = () => {
  const navigate = useNavigate();
  const targetAlpha = 48; // 목표 각도
  const { blurAmount, currentAlpha } = useBlurEffect(30);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed top-2 left-0 right-0 space-y-1 text-center z-10">
        <p className="text-xl font-bold text-white">{Math.round(currentAlpha)}°</p>
      </div>

      {/* 회전 텍스트 박스 */}
    <div className="fixed left-1/2 top-[30vh] -translate-x-1/2 z-0 rotate-[48deg]">
        <div
          style={{
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease',
          }}
          className="w-80 p-4 bg-gray-200 shadow-lg relative"
        >
          <p className="text-lg leading-relaxed text-gray-800 break-keep mb-8">
            큐레이터의 해설을 명쾌하고 매끄럽고 깔끔하고 편리하게 전달하는 보편적인 도슨트 기능에서 벗어나 조금은 번거롭고 비생산적이며 낯설지만, 
          </p>
          
          <div className="mt-14">
          {/* 이전 페이지 화살표 (좌측) */}
          <div 
            className="absolute bottom-2 left-2 cursor-pointer"
            onClick={() => navigate('/tutorial1')}
          >
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none"
              className="rotate-180" // 화살표를 반대 방향으로 회전
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

          {/* 다음 페이지 화살표 (우측) */}
          <div 
            className="absolute bottom-2 right-2 cursor-pointer"
            onClick={() => navigate('/tutorial3')}
          >
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none"
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
    </div>
  );
};

export default Tutorial2; 