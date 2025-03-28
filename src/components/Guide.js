import React from 'react';

const Guide = ({ show }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="relative z-50 text-center bg-white/80 shadow-xl p-4 pt-12">
        {/* 회전하는 사각형 */}
        <div className="flex justify-center mb-4 ">
          <div className="w-[100px] h-[60px] border-2 bg-gray-300 border-gray-900 animate-rotate-left"></div>
        </div>
        <p className="mb-6 p-4 pb-2 text-black">
          기기를 회전하며 방향을 찾아보세요.
        </p>
      </div>
    </div>
  );
};

export default Guide;