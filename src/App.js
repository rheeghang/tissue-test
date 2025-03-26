import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import ExhibitionText from './components/ExhibitionText'
import Menu from './components/Menu'

function App() {
  return (
    <Router>
      <div className="App">
        <Menu isEnabled={true} />
        <Routes>
          <Route path="/" element={<ExhibitionText />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
