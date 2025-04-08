import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './providers/AppProvider';
import Home from './pages/Home';
import Tutorial from './Tutorials/Tutorial';
import ArtworkPage from './pages/ArtworkPage';
import About from './pages/About';
import ScreenReaderText from './components/ScreenReaderText';
import LiveAnnouncer from './components/LiveAnnouncer';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutorial/step/:number" element={<Tutorial />} />
          <Route path="/artwork/:pageNumber" element={<ArtworkPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <LiveAnnouncer />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
