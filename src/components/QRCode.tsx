import { QRCodeSVG } from 'qrcode.react';

export default function QRCode() {
  const url = 'https://acc-blur-test.vercel.app/';
  
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <QRCodeSVG
        value={url}
        size={300}
        level="H"
        bgColor="#ffffff"
        fgColor="#000000"
        includeMargin={true}
      />
      <p className="text-sm text-gray-600 break-all max-w-[300px] text-center">
        {url}
      </p>
    </div>
  );
} 