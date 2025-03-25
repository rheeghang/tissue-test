import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './Pages/Home'
import ExhibitionText from './components/ExhibitionText'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ExhibitionText />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
