import React, { createContext, useState, useContext } from 'react';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  const [isOrientationMode, setIsOrientationMode] = useState(true);

  return (
    <ModeContext.Provider value={{ isOrientationMode, setIsOrientationMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);
