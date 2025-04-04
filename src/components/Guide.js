import React from 'react';

const Guide = ({ show, language }) => {
  const guideText = {
    ko: "기기를 회전하며 방향을 찾아보세요.",
    en: "Rotate your device to find the direction."
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="relative z-50 text-center">
        {/* 회전하는 사각형 */}
        <div className="flex justify-center mb-4 ">
          <div className="w-[100px] h-[60px] border-2 border-white animate-rotate-left"></div>
        </div>
        <p className="mb-6 p-4 pb-2 text-white">
          {guideText[language] || guideText.ko}
        </p>
      </div>
    </div>
  );
};

export default Guide;