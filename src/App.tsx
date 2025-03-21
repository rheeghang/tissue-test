import React from 'react';
import QRCode from './components/QRCode';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">ACC Tissue QR Code</h1>
      <QRCode />
    </div>
  );
}

export default App; 