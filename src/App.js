import React from 'react';
import ArtPage from './components/ArtPage';
import { BlurProvider } from './contexts/BlurContext';
import { GuideProvider } from './contexts/GuideContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModeProvider } from './contexts/ModeContext';
import Page1 from './Pages/Page1';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <LanguageProvider>
      <BlurProvider>
        <GuideProvider>
          <ModeProvider>
            <Router>
              <Routes>
                <Route path="/" element={<ArtPage />} />
                <Route path="/1" element={<Page1 />} />
              </Routes>
            </Router>
          </ModeProvider>
        </GuideProvider>
      </BlurProvider>
    </LanguageProvider>
  );
};

export default App;
