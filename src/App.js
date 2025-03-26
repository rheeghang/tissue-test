import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ExhibitionText from './components/ExhibitionText'
import Home from './Pages/Home'
import Menu from './components/Menu'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <Router>
      <div className="App">
        <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
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
