import React, { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';

const Menu = ({ isOpen, onClose }) => {
  const [isAngleMode, setIsAngleMode] = useState(false);

  const menuItems = [
    { id: 1, label: '홈보이지 않는 조각들: 공기조각', path: '/1' },
    { id: 2, label: '코 없는 코끼리 no.2', path: '/2' },
    { id: 3, label: '들리지 않는 속삭임-33번의 흔들림', path: '/3' },
    { id: 4, label: '궤도(토토포노로지 #4)', path: '/4' },
    { id: 5, label: '녹는점', path: '/5' },
    { id: 6, label: '소셜 댄스', path: '/6' },
    { id: 7, label: '아슬아슬', path: '/7' },
    { id: 8, label: '안녕히 엉키기', path: '/8' },
  ];

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-[9999] ${
      isOpen ? 'opacity-100 visible' : 'opacity-0 invisible hidden'
    }`}>
      <div className={`fixed top-5 left-5 right-5 bottom-5 max-w-[400px] mx-auto bg-white shadow-lg transform transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-3xl mx-auto p-2 text-center h-full overflow-y-auto">
          <div className="flex justify-center mb-2">
            <button
              onClick={onClose}
              className="px-2 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              [닫기]
            </button>
          </div>
          <nav>
            <ul className="space-y-3 px-1">
              {menuItems.map((item) => (
                <li key={item.id} className="px-2">
                  <a
                    href={item.path}
                    className="block px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200 border-2 border-black"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="py-4">
            <ToggleSwitch 
              isOn={isAngleMode} 
              onToggle={() => setIsAngleMode(!isAngleMode)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu; 