import React, { useState, useEffect, useRef } from 'react'
import RotatedText from './RotatedText'

const ExhibitionText = () => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const audioRef = useRef(null)
  const initialSoundPlayed = useRef(false)
  const textReadPlayed = useRef(false)
  const synth = window.speechSynthesis
  const audioPlayed = useRef(false) // 오디오가 재생 중인지 여부
  const fadeInInterval = useRef(null)
  const fadeOutInterval = useRef(null)
  
  // 목표 각도 및 허용 범위 설정
  const targetBeta = 45
  const targetGamma = -60
  const tolerance = 15
  const maxBlur = 10

  const title = "우리의 몸에는 타인이 깃든다"
  const originalText = `2025 ACC 접근성 강화 주제전 《우리의 몸에는 타인이 깃든다》는 '경계 넘기'를 주제로 ...`


  // 🔹 오디오 페이드 인 함수 (수정됨)
const fadeInAudio = () => {
  if (audioRef.current && !audioPlayed.current) {
    clearInterval(fadeOutInterval.current) // 페이드 아웃 중이면 중단

    // 📌 사용자 상호작용이 있어야만 재생 가능
    const playPromise = audioRef.current.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audioRef.current.volume = 0
          audioPlayed.current = true

          let volume = 0
          fadeInInterval.current = setInterval(() => {
            if (volume < 1) {
              volume = Math.min(1, volume + 0.05) // 최대 1.0까지만 증가
              audioRef.current.volume = volume
            } else {
              clearInterval(fadeInInterval.current)
            }
          }, 100)
        })
        .catch((error) => {
          console.error("오디오 자동 재생 실패:", error)
        })
    }
  }
}

// 🔹 오디오 페이드 아웃 함수 (수정됨)
const fadeOutAudio = () => {
  if (audioRef.current && audioPlayed.current) {
    clearInterval(fadeInInterval.current) // 페이드 인 중이면 중단

    let volume = 1
    fadeOutInterval.current = setInterval(() => {
      if (volume > 0) {
        volume = Math.max(0, volume - 0.05) // 최소 0.0까지만 감소
        audioRef.current.volume = volume
      } else {
        clearInterval(fadeOutInterval.current)
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioPlayed.current = false // 오디오 상태 업데이트
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
  // 사용자 클릭 이벤트 리스너 추가 (최초 1회만 실행)
  window.addEventListener("click", enableAudioOnUserInteraction, { once: true })
  window.addEventListener("touchstart", enableAudioOnUserInteraction, { once: true })

  return () => {
    window.removeEventListener("click", enableAudioOnUserInteraction)
    window.removeEventListener("touchstart", enableAudioOnUserInteraction)
  }
}, [])

  // 🔹 텍스트 읽기 함수
  const speakText = (text) => {
    if (!textReadPlayed.current) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ko-KR'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      synth.speak(utterance)

      textReadPlayed.current = true
    }
  }

  // 🔹 방향 감지 이벤트 핸들러
  const handleOrientation = (event) => {
    const { beta, gamma } = event
    const betaDiff = Math.abs(beta - targetBeta)
    const gammaDiff = Math.abs(gamma - targetGamma)
    
    if (betaDiff <= tolerance && gammaDiff <= tolerance) {
      // 📌 ✅ 각도 범위 안: 블러 제거 + 오디오 페이드 아웃 + 보이스 오버 실행
      setBlurAmount(0)
      fadeOutAudio()
      speakText(title + '. ' + originalText)
    } else {
      // 📌 ❌ 각도 범위 밖: 블러 증가 + 오디오 페이드 인
      const blur = Math.min(maxBlur, Math.max(betaDiff, gammaDiff) / 5)
      setBlurAmount(blur)
      fadeInAudio()

      // 블러가 다시 생기면 다음번 보이스 오버를 위해 초기화
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