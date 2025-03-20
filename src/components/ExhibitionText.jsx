import React, { useState, useEffect, useRef } from 'react'
import RotatedText from './RotatedText'

const ExhibitionText = () => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const audioRef = useRef(null)
  const initialSoundPlayed = useRef(false)
  const textReadPlayed = useRef(false)
  const synth = window.speechSynthesis
  
  // 목표 각도 및 허용 범위 설정
  const targetBeta = 45
  const targetGamma = -60
  const tolerance = 10
  const maxBlur = 10
  
  // iOS 디바이스 체크
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  const title = "우리의 몸에는 타인이 깃든다"
  const originalText = `2025 ACC 접근성 강화 주제전 《우리의 몸에는 타인이 깃든다》는 '경계 넘기'를 주제로 존재의 '다름'을 인정할 뿐만 아니라 나와 다른 존재에 취해야 할 태도에 대해 고민하는 전시입니다. 우리 안에는 다양한 경계가 있습니다.  '안과 밖', '우리와 타인', '안전한 것과 위험한 것', '나 그리고 나와 다른' 등의 언어처럼 말이죠. 그러나 경계가 지극히 상대적인 개념이며, 나 또한 누군가에게는 또 다른 타자가 될 수 있다면요? 내가 나인 채로 당신이 당신인 채로, 우리는 어떻게 비대칭적으로 소통하고 함께할 수 있을까요?`

  // 텍스트 읽기 함수
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR'  // 한국어 설정
    utterance.rate = 1.0      // 읽기 속도
    utterance.pitch = 1.0     // 음높이
    synth.speak(utterance)
  }

  useEffect(() => {
    // 컴포넌트 마운트 시 초기 사운드 재생
    if (!initialSoundPlayed.current && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          initialSoundPlayed.current = true
        })
        .catch(err => console.log('오디오 재생 실패:', err))
    }
  }, [])

  // 방향 감지 이벤트 핸들러
  const handleOrientation = (event) => {
    const { beta, gamma } = event
    const betaDiff = Math.abs(beta - targetBeta)
    const gammaDiff = Math.abs(gamma - targetGamma)
    
    if (betaDiff <= tolerance && gammaDiff <= tolerance) {
      setBlurAmount(0)
      // 블러가 0이 되고 아직 텍스트를 읽지 않았다면
      if (!textReadPlayed.current) {
        speakText(title + '. ' + originalText)
        textReadPlayed.current = true
      }
    } else {
      const blur = Math.min(maxBlur, Math.max(betaDiff, gammaDiff) / 5)
      setBlurAmount(blur)
      // 블러가 다시 생기면 다음번을 위해 초기화
      textReadPlayed.current = false
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

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      synth.cancel() // 음성 합성 정지
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
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
          <audio 
            ref={audioRef} 
            src="/assets/sound.mp3"
            preload="auto"  // 오디오 미리 로드
          />
          <div 
            className="fixed bottom-4 left-0 w-full text-center text-sm text-exhibition-text opacity-50"
            aria-live="polite"
            aria-atomic="true"
          >
            현재 각도: β(x): {Math.round(blurAmount)}° γ(y): {Math.round(blurAmount)}°
            <span className="sr-only">
              {blurAmount === 0 ? '텍스트가 선명하게 보입니다.' : '원하는 각도를 찾아보세요.'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default ExhibitionText