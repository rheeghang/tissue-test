import React, { useState, useEffect } from 'react'
import RotatedText from './RotatedText'

const ExhibitionText = () => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [permissionGranted, setPermissionGranted] = useState(false)
  
  // 목표 각도 및 허용 범위 설정
  const targetBeta = 45
  const targetGamma = -60
  const tolerance = 10
  const maxBlur = 10
  
  // iOS 디바이스 체크
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  const title = "우리의 몸에는 타인이 깃든다"
  const originalText = `2025 ACC 접근성 강화 주제전 《우리의 몸에는 타인이 깃든다》는 장애인의 창작 및 향유 접근성을 높이고자 기획한 전시다. 국립아시아문화전당은 개관 10주년을 맞아, 무장애(배리어 프리·Barrier free)를 단순한 보조 도구나 장치로 보는 것을 넘어 융복합 콘텐츠의 장르로 정례화하고자 한다.
《우리의 몸에는 타인이 깃든다》는 '경계 넘기'를 주제로 존재의 '다름'을 인정할 뿐만 아니라 나와 다른 존재에 취해야 할 태도에 대해 고민한다. 사회적, 문화적, 지리적, 생물학적 경계는 우리의 삶 곳곳에 존재하며, 우리는 이러한 경계를 '안과 밖', '우리와 타인', '안전한 것과 위험한 것', '나 그리고 나와 다른' 등의 언어로 구분 짓는다. 하지만 존재에 대한 이분법적 구분은 때로는 소외를 낳고, 차이를 포용하지 못하며 타인을 배제하는 기제로 작용한다. 전시는 이러한 경계가 지극히 상대적인 개념임을 인식하고 나 또한 누군가에게는 또 다른 타자가 될 수 있음을 자각하는 과정을 탐색하고자 한다.
전시 제목인 '우리의 몸에는 타인이 깃든다'는 규범과 예술, 장애가 있는 몸의 관계를 성찰하는 작업을 전개하는 김원영 작가의 책 『온전히 평등하고 지극히 차별적인』(2024)에서 발췌한 문구이다.`

  // 방향 감지 이벤트 핸들러
  const handleOrientation = (event) => {
    const { beta, gamma } = event
    const betaDiff = Math.abs(beta - targetBeta)
    const gammaDiff = Math.abs(gamma - targetGamma)
    
    if (betaDiff <= tolerance && gammaDiff <= tolerance) {
      setBlurAmount(0)
    } else {
      const blur = Math.min(maxBlur, Math.max(betaDiff, gammaDiff) / 5)
      setBlurAmount(blur)
    }
  }

  // iOS 권한 요청
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
          window.addEventListener('deviceorientation', handleOrientation)
        }
      } catch (error) {
        console.error('Error requesting permission:', error)
      }
    } else {
      setPermissionGranted(true)
      window.addEventListener('deviceorientation', handleOrientation)
    }
  }

  useEffect(() => {
    // DeviceOrientation 초기화
    if (window.DeviceOrientationEvent) {
      if (isIOS) {
        requestPermission()
      } else {
        setPermissionGranted(true)
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  // 키보드로 블러 효과 제어 (접근성 향상)
  const handleKeyDown = (e) => {
    if (e.key === 'f' || e.key === 'F') {
      setBlurAmount(0) // 'F' 키를 누르면 블러 제거
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="flex justify-center items-center min-h-screen bg-exhibition-bg overflow-hidden">
      {!permissionGranted && isIOS ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-black">
            <h2 className="text-xl font-bold mb-4">권한 요청</h2>
            <p className="mb-4">기기 방향 감지 권한을 허용해 주세요.</p>
            <button
              onClick={requestPermission}
              className="bg-exhibition-bg text-exhibition-text px-4 py-2 rounded hover:opacity-90 transition-opacity"
            >
              권한 허용하기
            </button>
          </div>
        </div>
      ) : (
        <>
          <RotatedText text={originalText} title={title} blurAmount={blurAmount} />
          <div 
            className="fixed bottom-4 left-0 w-full text-center text-sm text-exhibition-text opacity-50"
            aria-live="polite"
            aria-atomic="true"
          >
            현재 각도: β(x): {Math.round(blurAmount)}° γ(y): {Math.round(blurAmount)}°
            <span className="sr-only">
              {blurAmount === 0 ? '텍스트가 선명하게 보입니다.' : '텍스트가 흐릿하게 보입니다. 디바이스 각도를 조정하거나 F 키를 눌러 선명하게 볼 수 있습니다.'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default ExhibitionText
