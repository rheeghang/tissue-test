import React from 'react';
import { BlurProvider } from '../contexts/BlurContext';
import { GuideProvider } from '../contexts/GuideContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ModeProvider } from '../contexts/ModeContext';
import { ScreenReaderProvider } from '../contexts/ScreenReaderContext';

export const AppProvider = ({ children }) => {
  return (
    <LanguageProvider>
      <ModeProvider>
        <BlurProvider>
          <GuideProvider>
            <ScreenReaderProvider>
              {children}
            </ScreenReaderProvider>
          </GuideProvider>
        </BlurProvider>
      </ModeProvider>
    </LanguageProvider>
  );
}; 