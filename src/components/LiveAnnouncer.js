import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LiveAnnouncer = ({ message, clearMessage }) => {
  const { language } = useLanguage();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearMessage();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  return message ? (
    <div 
      className="sr-only" 
      role="alert" 
      aria-live="assertive"
    >
      {message}
    </div>
  ) : null;
};

export default LiveAnnouncer; 