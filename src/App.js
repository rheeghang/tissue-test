import { useState, useEffect } from 'react'
import Menu from './components/Menu'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    let lastShakeTime = 0
    const SHAKE_THRESHOLD = 15
    const SHAKE_INTERVAL = 1000

    const handleMotion = (event) => {
      const now = Date.now()
      if (now - lastShakeTime < SHAKE_INTERVAL) return

      const { accelerationIncludingGravity } = event
      if (!accelerationIncludingGravity) return

      const shakeStrength =
        Math.abs(accelerationIncludingGravity.x || 0) +
        Math.abs(accelerationIncludingGravity.y || 0) +
        Math.abs(accelerationIncludingGravity.z || 0)

      if (shakeStrength > SHAKE_THRESHOLD) {
        setIsMenuOpen(true)
        lastShakeTime = now
      }
    }

    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [])

  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className="App">
      <Menu 
        isOpen={isMenuOpen} 
        onClose={handleCloseMenu}
      />
    </div>
  )
}

export default App
