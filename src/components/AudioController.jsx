import React, { useEffect, useRef, useState } from 'react'

const AudioController = ({
  isPlaying,
  setIsPlaying,
  showAudioButton,
  setShowAudioButton,
  setDebugInfo,
  originalText,
  maxAngleDiff,
  tolerance,
  maxDistance
}) => {
  const [audioStatus, setAudioStatus] = useState('대기중')
  const [ttsStatus, setTtsStatus] = useState('대기중')
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isOrientationEnabled, setIsOrientationEnabled] = useState(true)
  const [hasUserInteraction, setHasUserInteraction] = useState(false)
  const utteranceRef = useRef(null)
  const gainNodeRef = useRef(null)
  const audioContextRef = useRef(null)

  useEffect(() => {
    if (!isPlaying) return

    // AudioContext 초기화
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
    }

    // TTS 설정
    const utterance = new SpeechSynthesisUtterance(originalText)
    utterance.lang = 'ko-KR'
    utterance.rate = 0.9
    utteranceRef.current = utterance

    // TTS 이벤트 핸들러
    utterance.onstart = () => {
      setTtsStatus('재생 중')
      // 페이드인 시작
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime)
        gainNodeRef.current.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + 2)
      }
    }

    utterance.onend = () => {
      setTtsStatus('재생 완료')
    }

    utterance.onerror = (event) => {
      setTtsStatus('오류: ' + event.error)
    }

    // 각도에 따른 TTS 제어
    const isInTargetAngle = maxAngleDiff <= tolerance

    if (isInTargetAngle && !window.speechSynthesis.speaking) {
      window.speechSynthesis.speak(utterance)
    } else if (!isInTargetAngle && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
    }

    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
      if (audioContextRef.current) {
        gainNodeRef.current.gain.cancelScheduledValues(audioContextRef.current.currentTime)
      }
    }
  }, [isPlaying, maxAngleDiff, tolerance, originalText])


}

export default AudioController