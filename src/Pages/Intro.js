import React from 'react';
import { useNavigate } from 'react-router-dom';

const Intro = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">

      <div className="mt-auto mb-20 w-full max-w-2xl px-10 py-10 rotate-180">
        <h1 className="text-xl leading-base mb-6 text-center">2025 ACC 접근성 강화 주제전
        <br></br>
        우리의 몸에는 타인이 깃든다
        </h1>
        
        <div className="space-y-6">
          <p className="text-left leading-relaxed break-keep leading-base">
            <p>2025 ACC 접근성 강화 주제전 《우리의 몸에는 타인이 깃든다》는 '경계 넘기'를 주제로 존재의 '다름'을 인정할 뿐만 아니라 나와 다른 존재에 취해야 할 태도에 대해 고민하는 전시입니다. 우리 안에는 다양한 경계가 있습니다. 
            </p>
            <br></br>
            <p>
             '안과 밖', '우리와 타인', '안전한 것과 위험한 것', '나 그리고 나와 다른' 등의 언어처럼 말이죠. 그러나 경계가 지극히 상대적인 개념이며, 나 또한 누군가에게는 또 다른 타자가 될 수 있다면요? 내가 나인 채로 당신이 당신인 채로, 우리는 어떻게 비대칭적으로 소통하고 함께할 수 있을까요?
            </p>
          </p>
        </div>

      </div>
      <div className="w-full fixed bottom-2 left-2 right-2 bg-black text-white p-2 text-center">
            휴대폰을 흔들면 메뉴가 열립니다.
        </div>
    </div>
            
  );
};

export default Intro;

