import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import ExhibitionText from './components/ExhibitionText';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExhibitionText />} />
        {/* <Route path="/" element={<Home />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

console.log('🗣️ TTS 상태:', {
  speaking: window.speechSynthesis.speaking,
  pending: window.speechSynthesis.pending,
  paused: window.speechSynthesis.paused
})

const noiseSound = noiseSoundRef.current
console.log('🔊 노이즈 상태:', {
  readyState: noiseSound?.readyState,
  paused: noiseSound?.paused,
  volume: noiseSound?.volume,
  error: noiseSound?.error
})

export default App;
