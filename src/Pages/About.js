import React from 'react';
import koData from '../i18n/ko.json';

const About = () => {
  const { title, subtitle, body } = koData.about;

  return (
    <div className="min-h-screen bg-black fixed w-full flex items-center justify-center">
      <div className="w-[90vw] h-[90vh] flex items-center justify-center">
        <div 
          className="container h-full overflow-y-auto overflow-x-hidden flex flex-col p-5 text-black leading-relaxed"
          style={{
            background: 'linear-gradient(to left, #FFEA7B, #FACFB9)'
          }}
        >
            <div className="text-center mb-8 w-full max-w-2xl">
              <p className="text-base mb-2">{subtitle}</p>
              <h1 className="text-2xl font-bold mb-4">{title}</h1>
            </div>
            
            <div 
              className="text-base leading-relaxed break-keep w-full max-w-2xl"
              dangerouslySetInnerHTML={{ __html: body }}
            />
      </div>
      <div className="fixed top-3 right-10 left-10 items-center justify-center p-1 bg-white/80 text-black text-center text-sm">
        다음 작품으로 이동하려면 흔들어주세요.
      </div>
      </div>
    </div>
  );
};

export default About;