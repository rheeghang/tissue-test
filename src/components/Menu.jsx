import React, { useState, useEffect } from 'react'

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [lastShakeTime, setLastShakeTime] = useState(0)
  const [shakeCount, setShakeCount] = useState(0)

  useEffect(() => {
    const handleMotion = (event) => {
      const acceleration = event.acceleration
      const currentTime = new Date().getTime()

      if (acceleration) {
        const { x, y, z } = acceleration
        const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z)

        // 가속도가 15 이상일 때 흔들림으로 감지
        if (accelerationMagnitude > 15) {
          if (currentTime - lastShakeTime > 1000) { // 1초 이상 간격
            setShakeCount(prev => prev + 1)
            setLastShakeTime(currentTime)

            // 3번 연속으로 흔들면 메뉴 열기
            if (shakeCount >= 2) {
              setIsOpen(true)
              setShakeCount(0)
            }
          }
        }
      }
    }

    // iOS Safari에서 DeviceMotionEvent 권한 요청
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion)
          }
        })
        .catch(console.error)
    } else {
      window.addEventListener('devicemotion', handleMotion)
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion)
    }
  }, [lastShakeTime, shakeCount])

  return (
    <div className={`fixed inset-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">메뉴</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            닫기
          </button>
        </div>
        <nav>
          <ul className="space-y-4">
            <li>
              <a href="/" className="block hover:text-gray-600">홈</a>
            </li>
            <li>
              <a href="/about" className="block hover:text-gray-600">소개</a>
            </li>
            <li>
              <a href="/contact" className="block hover:text-gray-600">연락처</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Menu 