import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import ExhibitionText from './components/ExhibitionText'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExhibitionText />} />
        {/* <Route path="/" element={<Home />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
