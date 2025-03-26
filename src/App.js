import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ExhibitionText from './components/ExhibitionText'
import Home from './Pages/Home'
import Menu from './components/Menu'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleMotion = (event) => {
      const SHAKE_THRESHOLD = 15
      const SHAKE_INTERVAL = 1000
      let lastShakeTime = 0

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
    <Router>
      <div className="App">
        <Menu 
          isOpen={isMenuOpen} 
          onClose={handleCloseMenu}
        />
        <Routes>
          <Route path="/" element={<ExhibitionText />} />
          <Route path="/home" element={<Home />} />
          <Route path="/Home" element={<Home />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
