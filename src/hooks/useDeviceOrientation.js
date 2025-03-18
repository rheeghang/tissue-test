import { useState, useEffect } from 'react'

export const useDeviceOrientation = () => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const targetBeta = 45
  const targetGamma = -60
  const tolerance = 10
  const maxBlur = 10
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

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

  const initializeOrientationListener = () => {
    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }

  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
          initializeOrientationListener()
        }
      } catch (error) {
        console.error('Error requesting permission:', error)
      }
    } else {
      setPermissionGranted(true)
      initializeOrientationListener()
    }
  }

  useEffect(() => {
    if (window.DeviceOrientationEvent) {
      if (isIOS) {
        requestPermission()
      } else {
        setPermissionGranted(true)
        initializeOrientationListener()
      }
    }
  }, [])

  return { blurAmount, permissionGranted, requestPermission, isIOS }
} 