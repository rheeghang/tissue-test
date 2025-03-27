import React, { useState, useEffect } from 'react';
import Menu from './Menu';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const SHAKE_THRESHOLD = 15;
  const SHAKE_INTERVAL = 1000;
  let lastShakeTime = 0;

  const handleMotion = (event) => {
    const now = Date.now();
    if (now - lastShakeTime < SHAKE_INTERVAL) return;

    const { acceleration } = event;
    if (!acceleration) return;

    const shakeStrength = 
      Math.abs(acceleration.x) +
      Math.abs(acceleration.y) +
      Math.abs(acceleration.z);

    if (shakeStrength > SHAKE_THRESHOLD) {
      setIsMenuOpen(true);
      lastShakeTime = now;
    }
  };

  useEffect(() => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  return (
    <>
      {children}
      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
};

export default Layout; 