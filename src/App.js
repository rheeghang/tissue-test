import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ExhibitionText from './components/ExhibitionText'
import Home from './Pages/Home'
import Menu from './components/Menu'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleShake = () => {
    setIsMenuOpen(true)
  }

  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <Router>
      <div className="App">
        <Menu 
          isOpen={isMenuOpen} 
          onClose={handleCloseMenu}
          onShake={handleShake}
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
