import React, { useState, useEffect } from 'react'

const ExhibitionText = () => {
  const [blurAmount, setBlurAmount] = useState(10)
  const targetBeta = 45
  const targetGamma = -60
  const tolerance = 10
  const maxBlur = 10

  useEffect(() => {
    // Device Orientation API 지원 확인
    if (window.DeviceOrientationEvent) {
      const handleOrientation = (event) => {
        const { beta, gamma } = event
        
        // beta와 gamma가 목표 각도에서 얼마나 떨어져 있는지 계산
        const betaDiff = Math.abs(beta - targetBeta)
        const gammaDiff = Math.abs(gamma - targetGamma)
        
        // tolerance 범위 내에 있으면 블러 제거, 아니면 거리에 비례하여 블러 적용
        if (betaDiff <= tolerance && gammaDiff <= tolerance) {
          setBlurAmount(0)
        } else {
          // 각도 차이에 따른 블러 계산 (최대 maxBlur까지)
          const blur = Math.min(
            maxBlur,
            Math.max(betaDiff, gammaDiff) / 5 // 5로 나누어 블러 효과를 부드럽게 조절
          )
          setBlurAmount(blur)
        }
      }

      // 이벤트 리스너 등록
      window.addEventListener('deviceorientation', handleOrientation)

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    } else {
      console.log('Device Orientation API is not supported')
    }
  }, [])

  return (
    <div className="min-h-screen bg-blue-600 text-yellow-300 text-2xl leading-[165%] px-[10vw] py-10 h-screen overflow-y-scroll text-left transform rotate-15 origin-center">
      <div style={{ filter: `blur(${blurAmount}px)` }} className="transition-all duration-300">
        <h1 className="text-3xl p-0 text-center">
          우리의 몸에는 <br />
          타인이 깃든다
        </h1>
        <p className="mb-4">
          2025 ACC 접근성 강화 주제전 《우리의 몸에는 타인이 깃든다》는 장애인의 창작 및 향유 접근성을
          높이고자 기획한 전시다. 국립아시아문화전당은 개관 10주년을 맞아, 무장애(배리어 프리·Barrier
          free)를 단순한 보조 도구나 장치로 보는 것을 넘어 융복합 콘텐츠의 장르로 정례화하고자 한다.
        </p>
        <p className="mb-4">
          《우리의 몸에는 타인이 깃든다》는 '경계 넘기'를 주제로 존재의 '다름'을 인정할 뿐만 아니라
          나와 다른 존재에 취해야 할 태도에 대해 고민한다. 사회적, 문화적, 지리적, 생물학적 경계는
          우리의 삶 곳곳에 존재하며, 우리는 이러한 경계를 '안과 밖', '우리와 타인', '안전한 것과
          위험한 것', '나 그리고 나와 다른' 등의 언어로 구분 짓는다. 하지만 존재에 대한 이분법적
          구분은 때로는 소외를 낳고, 차이를 포용하지 못하며 타인을 배제하는 기제로 작용한다. 전시는
          이러한 경계가 지극히 상대적인 개념임을 인식하고 나 또한 누군가에게는 또 다른 타자가 될 수
          있음을 자각하는 과정을 탐색하고자 한다.
        </p>
        <p className="mb-4">
          전시 제목인 '우리의 몸에는 타인이 깃든다'는 규범과 예술, 장애가 있는 몸의 관계를 성찰하는
          작업을 전개하는 김원영 작가의 책 '온전히 평등하고 지극히 차별적인'(2024)에서 발췌한
          문구이다.
        </p>
      </div>
      <div className="fixed bottom-4 left-4 text-sm opacity-50">
        현재 각도: β(x): {Math.round(blurAmount)}° γ(y): {Math.round(blurAmount)}°
      </div>
    </div>
  )
}

export default ExhibitionText
