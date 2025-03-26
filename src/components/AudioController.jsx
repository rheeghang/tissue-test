import React, { useEffect, useRef, useState } from 'react'

const AudioController = ({ 
  isPlaying, 
  setIsPlaying, 
  setDebugInfo,
  originalText,
  maxAngleDiff,
  tolerance,
  title = "보이지 않는 조각들: 공기조각",
  artist = "송예슬"
}) => {
  const noiseSoundRef = useRef(null)
  const lastUpdateRef = useRef(0)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isOrientationEnabled, setIsOrientationEnabled] = useState(false)
  const wordsArrayRef = useRef(`${title}. 작가 ${artist}. ${originalText}`.split(' '))

  // 오디오 초기화 함수
  const initAudio = () => {
    try {
      if (noiseSoundRef.current) {
        noiseSoundRef.current.pause()
        noiseSoundRef.current = null
      }

      const noiseSound = new Audio(process.env.PUBLIC_URL + '/sound1.mp3')
      noiseSound.loop = true
      noiseSound.volume = 1
      noiseSoundRef.current = noiseSound

      return noiseSound
    } catch (error) {
      console.error('오디오 초기화 실패:', error)
      return null
    }
  }

  // 오디오 초기화 useEffect
  useEffect(() => {
    if (!isPlaying) return

    const initializeAudio = async () => {
      try {
        const noiseSound = initAudio()
        if (noiseSound) {
          await noiseSound.play()
          const isInTargetAngle = maxAngleDiff <= tolerance
          noiseSound.volume = isInTargetAngle ? 0 : 1
        }
      } catch (error) {
        console.error('오디오 재생 실패:', error)
      }
    }

    initializeAudio()

    return () => {
      if (noiseSoundRef.current) {
        noiseSoundRef.current.pause()
        noiseSoundRef.current = null
      }
      window.speechSynthesis.cancel()
    }
  }, [isPlaying, maxAngleDiff, tolerance])

  // 각도에 따른 오디오 제어
  useEffect(() => {
    if (!isPlaying || !noiseSoundRef.current) return

    const now = Date.now()
    if (now - lastUpdateRef.current > 50) {
      lastUpdateRef.current = now
      
      const isInTargetAngle = maxAngleDiff <= tolerance
      const newVolume = isInTargetAngle ? 0 : 1

      if (noiseSoundRef.current.volume !== newVolume) {
        noiseSoundRef.current.volume = newVolume
      }

      // TTS 상태 관리
      if (isInTargetAngle) {
        if (!window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(wordsArrayRef.current.join(' '))
          utterance.lang = 'ko-KR'
          utterance.rate = 1.0
          utterance.pitch = 1.0
          utterance.volume = 1.0
          window.speechSynthesis.speak(utterance)
        }
      } else {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel()
        }
      }

      setDebugInfo(`
        각도차: ${maxAngleDiff.toFixed(1)}° | 
        허용범위: ${tolerance}° | 
        노이즈: ${noiseSoundRef.current.volume} | 
        TTS: ${window.speechSynthesis.speaking ? '재생중' : '정지'} | 
        현재 단어: ${wordsArrayRef.current[0]} |
        목표각도: ${isInTargetAngle ? '진입' : '이탈'} |
        재생상태: ${isPlaying ? '재생중' : '정지'}
      `)
    }
  }, [maxAngleDiff, tolerance, isPlaying, setDebugInfo])

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
        <div className="font-bold mb-2">디버그 정보:</div>
        <div>각도차: {maxAngleDiff.toFixed(1)}°</div>
        <div>노이즈 볼륨: {noiseSoundRef.current?.volume || 0}</div>
        <div>TTS 상태: {window.speechSynthesis.speaking ? '재생중' : '정지'}</div>
        <div>현재 단어: {wordsArrayRef.current[0]}</div>
        <div>재생 중: {isPlaying ? '예' : '아니오'}</div>
        <div>목표각도: {maxAngleDiff <= tolerance ? '진입' : '이탈'}</div>
        <div>iOS 권한: {permissionGranted ? '허용됨' : '미허용'}</div>
        <div>방향감지: {isOrientationEnabled ? '활성화' : '비활성화'}</div>
      </div>
    </>
  )
}

export default AudioController