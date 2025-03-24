import React, { useState, useEffect, useRef } from 'react'
import RotatedText from './RotatedText'

const ExhibitionText = () => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [ttsInitialized, setTtsInitialized] = useState(false)
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
  const maxDistance = 45 // 최대 거리 (각도 차이)

  const title = "우리의 몸에는 타인이 깃든다"
  const originalText = `2025 ACC 접근성 강화 주제전 《우리의 몸에는 타인이 깃든다》는 '경계 넘기'를 주제로 ...`

  // iOS 디바이스 체크 및 TTS 초기화
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(isIOSDevice)
    
    // TTS 초기화
    const initTTS = () => {
      if (synth) {
        // iOS에서 TTS 초기화를 위한 더미 발화
        const dummyUtterance = new SpeechSynthesisUtterance('')
        dummyUtterance.volume = 0
        synth.speak(dummyUtterance)
        setTtsInitialized(true)
      }
    }

    if (isIOSDevice) {
      setShowPermissionModal(true)
      // iOS에서는 사용자 상호작용 후 TTS 초기화
      const initOnInteraction = () => {
        initTTS()
        document.removeEventListener('touchstart', initOnInteraction)
        document.removeEventListener('click', initOnInteraction)
      }
      document.addEventListener('touchstart', initOnInteraction)
      document.addEventListener('click', initOnInteraction)
    } else {
      initTTS()
    }
  }, [])

  // 🔹 TTS 음성 페이드 인 & 클리어링 기능
  const speakTextWithEffect = (text, clarity) => {
    if (!ttsInitialized) return

    if (synth.speaking) {
      synth.cancel()
    }

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

    try {
      synth.speak(utterance)
    } catch (error) {
      console.error('TTS 실행 실패:', error)
    }
  }

  // iOS 권한 요청 처리
  const handlePermissionRequest = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
          setShowPermissionModal(false)
          window.addEventListener('deviceorientation', handleOrientation)
        }
      } catch (error) {
        console.error('권한 요청 실패:', error)
      }
    }
  }

  // 🔹 오디오 페이드 인 함수 (거리에 따른 볼륨 조절)
  const fadeInAudio = (distance) => {
    if (audioRef.current && !audioPlayed.current) {
      if (fadeOutInterval.current !== null) {
        clearInterval(fadeOutInterval.current)
        fadeOutInterval.current = null
      }
  
      if (fadeInInterval.current !== null) {
        return
      }
  
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioRef.current.volume = 0
            audioPlayed.current = true
  
            fadeInInterval.current = setInterval(() => {
              let currentVolume = audioRef.current.volume
              const targetVolume = Math.min(1, distance / maxDistance) // 거리에 따른 목표 볼륨
              if (currentVolume < targetVolume) {
                currentVolume = Math.min(targetVolume, currentVolume + 0.05)
                audioRef.current.volume = currentVolume
              } else {
                clearInterval(fadeInInterval.current)
                fadeInInterval.current = null
              }
            }, 100)
          })
          .catch((error) => {
            console.error("오디오 자동 재생 실패:", error)
          })
      }
    }
  }

  // 🔹 오디오 페이드 아웃 함수 (거리에 따른 볼륨 조절)
  const fadeOutAudio = (distance) => {
    if (audioRef.current && audioPlayed.current) {
      if (fadeInInterval.current !== null) {
        clearInterval(fadeInInterval.current)
        fadeInInterval.current = null
      }

      if (fadeOutInterval.current !== null) {
        return
      }

      let volume = audioRef.current.volume
      const targetVolume = Math.min(1, distance / maxDistance) // 거리에 따른 목표 볼륨
      fadeOutInterval.current = setInterval(() => {
        if (volume > targetVolume) {
          volume = Math.max(targetVolume, volume - 0.05)
          audioRef.current.volume = volume
        } else {
          clearInterval(fadeOutInterval.current)
          fadeOutInterval.current = null
          if (targetVolume === 0) {
            audioRef.current.pause()
            audioPlayed.current = false
          }
        }
      }, 100)
    }
  }

  // 🔹 방향 감지 이벤트 핸들러
  const handleOrientation = (event) => {
    const { beta, gamma } = event
    const betaDiff = Math.abs(beta - targetBeta)
    const gammaDiff = Math.abs(gamma - targetGamma)
    
    // 전체 거리 계산 (0~maxDistance)
    const distance = Math.min(maxDistance, Math.max(betaDiff, gammaDiff))
    
    // 명확도 계산 (0~1)
    const clarity = 1 - Math.min(1, distance / maxDistance)
    
    if (betaDiff <= tolerance && gammaDiff <= tolerance) {
      // 📌 ✅ 각도 범위 안: 블러 제거 + 오디오 페이드 아웃 + TTS 음성 실행
      setBlurAmount(0)
      fadeOutAudio(distance)
      if (!textReadPlayed.current) {
        speakTextWithEffect(title + '. ' + originalText, clarity)
        textReadPlayed.current = true
      }
    } else {
      // 📌 ❌ 각도 범위 밖: 블러 증가 + 오디오 페이드 인
      const blur = Math.min(maxBlur, distance / 5)
      setBlurAmount(blur)
      fadeInAudio(distance)

      // 블러가 다시 생기면 다음번 TTS를 위해 초기화
      textReadPlayed.current = false
    }
  }

  useEffect(() => {
    if (window.DeviceOrientationEvent) {
      setPermissionGranted(true)
      window.addEventListener('deviceorientation', handleOrientation)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  return (
    <div className="flex justify-center items-center min-h-screen bg-exhibition-bg overflow-hidden">
      <RotatedText text={originalText} title={title} blurAmount={blurAmount} />
      <audio ref={audioRef} src="/assets/sound.mp3" preload="auto" />
      
      {/* iOS 권한 요청 모달 */}
      {isIOS && showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h2 className="text-xl font-bold mb-4">방향 감지 권한 필요</h2>
            <p className="mb-4">이 기능을 사용하기 위해서는 기기의 방향 감지 권한이 필요합니다.</p>
            <button
              onClick={handlePermissionRequest}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              권한 허용하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExhibitionText