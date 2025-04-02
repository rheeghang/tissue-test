import React from 'react';
import ArtPage from './components/ArtPage';
import { BlurProvider } from './contexts/BlurContext';
import { GuideProvider } from './contexts/GuideContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModeProvider } from './contexts/ModeContext';

const App = () => {
  return (
    <LanguageProvider>
      <BlurProvider>
        <GuideProvider>
          <ModeProvider>
            <ArtPage />
          </ModeProvider>
        </GuideProvider>
      </BlurProvider>
    </LanguageProvider>
  );
};

export default App;
