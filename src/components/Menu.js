import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { useMode } from '../contexts/ModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import koData from '../i18n/ko.json';
import enData from '../i18n/en.json';

const Menu = ({ isOpen, onClose, onPageSelect, pageNumber }) => {
  const { isOrientationMode, setIsOrientationMode } = useMode();
  const { language } = useLanguage();
  
  // 언어에 따른 데이터 선택
  const data = language === 'ko' ? koData : enData;
  
  const menuItems = [
    { id: 'artwork1', label: data.page1.title, pageNumber: 1, bgClass: 'bg-page1-text', textClass: 'text-page1-bg' },
    { id: 'artwork2', label: data.page2.title, pageNumber: 2, bgClass: 'bg-page2-text', textClass: 'text-page2-bg' },
    { id: 'artwork3', label: data.page3.title, pageNumber: 3, bgClass: 'bg-page3-text', textClass: 'text-page3-bg' },
    { id: 'artwork4', label: data.page4.title, pageNumber: 4, bgClass: 'bg-page4-text', textClass: 'text-page4-bg' },
    { id: 'artwork5', label: data.page5.title, pageNumber: 5, bgClass: 'bg-page5-text', textClass: 'text-page5-bg' },
    { id: 'artwork6', label: data.page6.title, pageNumber: 6, bgClass: 'bg-page6-text', textClass: 'text-page6-bg' },
    { id: 'artwork7', label: data.page7.title, pageNumber: 7, bgClass: 'bg-page7-text', textClass: 'text-page7-bg' },
    { id: 'artwork8', label: data.page8.title, pageNumber: 8, bgClass: 'bg-page8-text', textClass: 'text-page8-bg' },
  ];

  // 모드 토글 핸들러
  const handleModeToggle = () => {
    setIsOrientationMode(!isOrientationMode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 z-51 flex items-center justify-center text-center">
      <div className="w-[85%] bg-white bg-opacity-80 shadow-lg mx-3 my-3 flex flex-col relative">

        <div className="h-8"></div>

        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {language === 'ko' 
                ? (isOrientationMode ? '각도 모드' : '각도해제 모드')
                : (isOrientationMode ? 'Angle Mode' : 'Angle Off')
              }
            </span>
            <button 
              onClick={handleModeToggle}
              className="focus:outline-none"
              aria-label="모드 전환"
            >
              <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                isOrientationMode ? 'bg-key-color' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-0 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  isOrientationMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-3">
          <div className="flex flex-col items-center">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageSelect(item.pageNumber);
                  onClose();
                }}
                className={`py-2 px-2 ${item.bgClass} ${item.textClass} mb-2 rounded-none shadow-md hover:opacity-90 transition-opacity font-medium flex items-center justify-center
                  ${pageNumber === item.pageNumber ? 'w-full' : 'w-[calc(100%-2rem)]'}`}
              >
                <span className="text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-12">
          <button
            onClick={() => {
              onPageSelect('home');
              onClose();
            }}
            className="w-1/2 h-full bg-white text-black border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => {
              onPageSelect('about');
              onClose();
            }}
            className="w-1/2 h-full bg-black text-white hover:bg-gray-900 transition-colors"
          >
            About
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu; 