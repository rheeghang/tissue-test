import React, { useState, useEffect, useRef } from 'react'
import RotatedText from './RotatedText'

const ExhibitionText = () => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [permissionGranted, setPermissionGranted] = useState(false)
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

  // 🔹 TTS 음성 페이드 인 & 클리어링 기능
  const speakTextWithEffect = (text, clarity) => {
    if (synth.speaking) synth.cancel()

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

  // 🔹 사용자 클릭 이벤트로 오디오 활성화
  const enableAudioOnUserInteraction = () => {
    if (audioRef.current && !initialSoundPlayed.current) {
      audioRef.current.play().then(() => {
        initialSoundPlayed.current = true
      }).catch(error => console.error("사용자 입력 없이 오디오 재생 불가:", error))
    }
  }

  useEffect(() => {
    window.addEventListener("click", enableAudioOnUserInteraction, { once: true })
    window.addEventListener("touchstart", enableAudioOnUserInteraction, { once: true })

    return () => {
      window.removeEventListener("click", enableAudioOnUserInteraction)
      window.removeEventListener("touchstart", enableAudioOnUserInteraction)
    }
  }, [])

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
    </div>
  )
}

export default ExhibitionText