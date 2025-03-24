import React, { useState, useEffect, useRef } from 'react'
import RotatedText from './RotatedText'

const ExhibitionText = () => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(true)
  const audioRef = useRef(null)
  const initialSoundPlayed = useRef(false)
  const textReadPlayed = useRef(false)
  const synth = window.speechSynthesis
  const audioPlayed = useRef(false)
  const fadeInInterval = useRef(null)
  const fadeOutInterval = useRef(null)
  
  // 목표 각도 및 허용 범위 설정
  const targetBeta = 45
  const targetGamma = -60
  const tolerance = 15
  const maxBlur = 10

  const title = "우리의 몸에는 타인이 깃든다"
  const originalText = `2025 ACC 접근성 강화 주제전 《우리의 몸에는 타인이 깃든다》는 '경계 넘기'를 주제로 존재의 '다름'을 인정할 뿐만 아니라 나와 다른 존재에 취해야 할 태도에 대해 고민하는 전시입니다. 우리 안에는 다양한 경계가 있습니다.  '안과 밖', '우리와 타인', '안전한 것과 위험한 것', '나 그리고 나와 다른' 등의 언어처럼 말이죠. 그러나 경계가 지극히 상대적인 개념이며, 나 또한 누군가에게는 또 다른 타자가 될 수 있다면요? 내가 나인 채로 당신이 당신인 채로, 우리는 어떻게 비대칭적으로 소통하고 함께할 수 있을까요?`

  // iOS 디바이스 체크
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)
    
    if (!isIOSDevice) {
      // iOS가 아닌 경우
      setPermissionGranted(true)
      window.addEventListener('deviceorientation', handleOrientation)
      return () => window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  // 권한 요청 함수
  const requestPermission = async () => {
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
          setShowPermissionModal(false)
          window.addEventListener('deviceorientation', handleOrientation)
        }
      } else {
        // 권한 요청이 필요 없는 경우
        setPermissionGranted(true)
        setShowPermissionModal(false)
        window.addEventListener('deviceorientation', handleOrientation)
      }
    } catch (error) {
      console.error('권한 요청 실패:', error)
    }
  }

  // 🔹 TTS 음성 페이드 인 & 클리어링 기능 추가 (JS 버전)
  const speakTextWithEffect = (text, clarity) => {
    if (synth.speaking) synth.cancel() // 기존 음성 중지

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR'

    // 각도에 따른 음성 조절
    utterance.rate = 0.5 + clarity * 1.0 // 속도 (0.5~1.5)
    utterance.volume = 0.1 + clarity * 0.9 // 볼륨 (0.1~1.0)

    // 음성 왜곡 효과 적용
    if (clarity < 0.3) {
      utterance.text = "........." + text // 처음엔 웅얼거리는 듯한 효과
    } else if (clarity < 0.6) {
      utterance.text = text.replace(/([가-힣])/g, "$1 ") // 단어가 띄엄띄엄 들리는 효과
    }

    synth.speak(utterance)
  }

  // 🔹 방향 감지 이벤트 핸들러 (TTS 음성 페이드 적용)
  const handleOrientation = (event) => {
    const { beta, gamma } = event
    const betaDiff = Math.abs(beta - targetBeta)
    const gammaDiff = Math.abs(gamma - targetGamma)

    let clarity = 1 - Math.min(1, Math.max(betaDiff, gammaDiff) / tolerance) // 0~1 값 생성
    const newBlur = maxBlur * (1 - clarity) // 블러 정도 조절 (0~10)
    setBlurAmount(newBlur)

    if (!textReadPlayed.current) {
      speakTextWithEffect(title + '. ' + originalText, clarity)
      textReadPlayed.current = true
    } else if (blurAmount > 2) {
      textReadPlayed.current = false // 블러가 생기면 다시 음성 활성화
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-exhibition-bg overflow-hidden">
      {showPermissionModal && isIOS ? (
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
        <RotatedText text={originalText} title={title} blurAmount={blurAmount} />
      )}
      <audio ref={audioRef} src="/assets/sound.mp3" preload="auto" />
    </div>
  )
}

export default ExhibitionText