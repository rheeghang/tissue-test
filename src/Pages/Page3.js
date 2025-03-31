import React, { useState, useEffect } from 'react';

const Page3 = () => {
  const title = "안녕히 엉키기";
  const artist = "김원영·손나예·여혜진·이지양·하은빈";
  const caption = "2025, 워크숍, 현장 퍼포먼스, 설치, 3채널 영상, 7채널 음향, 가변 크기<br />국립아시아문화전당 제작 지원, 작가 제공.";
  
  const originalText = `작품은 하나의 원형 무대와도 같습니다. 바닥은 카펫으로 덮여 있고, 주변에는 앉거나 누울 수 있는 방석이 있습니다. 천장을 올려다보면, 하나의 커다란 영상이 펼쳐집니다. 몸들이 구르고, 서로 기대고, 연결되며 만들어낸 영상 속 움직임은 별자리처럼 투영됩니다. 작품은 ACC에서 진행된 장애인- 비장애인 참여 워크숍에서 출발했습니다. 공간 곳곳에 놓인 5대 스피커에서는 다양한 목소리와 소리들이 흘러나옵니다. 무대 앞단 중앙에 위치한 좌대 위에는 참여자들이 워크숍에서 쓴 글들이 종이에 인쇄되어 비치되어 있고, 무대를 둘러싸고 있는 벽면에는 두 개의 모니터와 천장에서 내려오는 지향성 스피커가 설치되어 기록 영상을 감상할 수 있습니다. 낭독되는 목소리는 글을 쓴 사람의 것이기도 하고, 어쩌면 당신의 목소리처럼 들릴 수도 있습니다. 당신은 이 공간에서 어떻게 움직이고 싶나요? 앉을까요, 누울까요, 아니면 구르고 싶나요? 낯선 몸이 다가올 때, 당신의 몸은 어떻게 반응하나요? 소리는 언제 혼자 흐르고, 언제 서로 엉켜 들리나요? 목소리는 당신에게 위로인가요, 울림인가요? 지금, 당신은 누구의 몸짓에 귀를 기울이고 있나요? 이 작품은 단순한 퍼포먼스나 영상이 아니라, 감각의 연습장입니다. 말하지 않아도, 닿지 않아도, 몸과 마음은 천천히 엉키며 '우리'가 되어 갑니다. 지금, 당신은 이 무대에서 어떤 움직임을 상상하고 있나요? 그리고 당신의 몸은, 지금 누구에게 기대고 있나요?`;

  const [blurAmount, setBlurAmount] = useState(30); // 최대 블러값으로 시작
  const targetAlpha = 45;  // 목표 각도
  const tolerance = 25;    // 완전히 선명해지는 범위
  const clearThreshold = 35;  // 읽을 수 있는 범위
  const maxBlur = 30;     // 최대 블러값
  const maxDistance = 45;  // 최대 거리

  useEffect(() => {
    const handleOrientation = (event) => {
      const alpha = event.alpha || 0;
      const distance = Math.abs(alpha - targetAlpha);
      
      // 블러 값 계산
      let blur = maxBlur;
      if (distance <= tolerance) {
        blur = 0;
      } else if (distance <= clearThreshold) {
        blur = (distance - tolerance) * (maxBlur / (clearThreshold - tolerance));
      }
      
      setBlurAmount(blur);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  return (
    <div className="min-h-screen bg-black fixed w-full">
      <div className="outer-container rotate-[45deg] text-black relative w-[90%] h-[130vh] items-center justify-center">
        <div 
          className="container h-[150vh] max-w-2xl overflow-y-auto overflow-x-hidden"
          style={{
            filter: `blur(${blurAmount}px)`,
            transform: 'translateZ(0)',
            maxHeight: '120vh',
            overflowY: 'auto',
            WebkitScrollbar: 'none',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          <div className='container p-10 mt-[55vh] bg-cyan-500 mb-[100vh] relative w-[100%]'>
            <div className="text-center mb-8" style={{ filter: `blur(${blurAmount}px)`, transition: 'filter 0.3s ease' }}>
              <h1 className="text-xl font-bold mb-4">{title}</h1>
              <p className="text-base mb-2">{artist}</p>
              <p className="text-xs" dangerouslySetInnerHTML={{ __html: caption }} />
            </div>
            
            <div 
              className="text-base leading-relaxed break-keep"
              style={{ filter: `blur(${blurAmount}px)`, transition: 'filter 0.3s ease' }}
            >
            작품은 하나의 원형 무대와도 같습니다. 바닥은 카펫으로 덮여 있고, 주변에는 앉거나 누울 수 있는 방석이 있습니다.
            천장을 올려다보면, 하나의 커다란 영상이 펼쳐집니다. 몸들이 구르고, 서로 기대고, 연결되며 만들어낸 영상 속 움직임은 별자리처럼 투영됩니다. 
            <br></br>
            <br></br>
            작품은 ACC에서 진행된 장애인- 비장애인 참여 워크숍에서 출발했습니다. 공간 곳곳에 놓인 5대 스피커에서는 다양한 목소리와 소리들이 흘러나옵니다. 
            무대 앞단 중앙에 위치한 좌대 위에는 참여자들이 워크숍에서 쓴 글들이 종이에 인쇄되어 비치되어 있고, 무대를 둘러싸고 있는 벽면에는 두 개의 모니터와 천장에서 내려오는 지향성 스피커가 설치되어 기록 영상을 감상할 수 있습니다. 
            <br></br>
            <br></br>
            낭독되는 목소리는 글을 쓴 사람의 것이기도 하고, 어쩌면 당신의 목소리처럼 들릴 수도 있습니다. 당신은 이 공간에서 어떻게 움직이고 싶나요? 앉을까요, 누울까요, 아니면 구르고 싶나요? 낯선 몸이 다가올 때, 당신의 몸은 어떻게 반응하나요? 소리는 언제 혼자 흐르고, 언제 서로 엉켜 들리나요? 목소리는 당신에게 위로인가요, 울림인가요? 지금, 당신은 누구의 몸짓에 귀를 기울이고 있나요? 이 작품은 단순한 퍼포먼스나 영상이 아니라, 감각의 연습장입니다. 말하지 않아도, 닿지 않아도, 몸과 마음은 천천히 엉키며 '우리'가 되어 갑니다. 지금, 당신은 이 무대에서 어떤 움직임을 상상하고 있나요? 그리고 당신의 몸은, 지금 누구에게 기대고 있나요?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page3;