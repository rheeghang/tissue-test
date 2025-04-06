import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ScreenReaderText = ({ currentPage, alpha, beta, gamma, isOrientationMode }) => {
  const { language } = useLanguage();

  // 현재 상태에 대한 설명 생성
  const getStatusDescription = () => {
    if (language === 'ko') {
      return `현재 ${currentPage === 0 ? '홈' : currentPage}페이지에 있습니다. 
      ${isOrientationMode ? '각도 모드가 활성화되어 있습니다.' : '각도 모드가 비활성화되어 있습니다.'}
      현재 기기의 각도는 Z축 ${Math.round(alpha)}도, X축 ${Math.round(beta)}도, Y축 ${Math.round(gamma)}도 입니다.`;
    } else {
      return `You are currently on ${currentPage === 0 ? 'home' : `page ${currentPage}`}. 
      ${isOrientationMode ? 'Angle mode is activated.' : 'Angle mode is deactivated.'}
      Current device angles are Z-axis ${Math.round(alpha)} degrees, X-axis ${Math.round(beta)} degrees, Y-axis ${Math.round(gamma)} degrees.`;
    }
  };

  // 현재 작업에 대한 안내 생성
  const getActionGuide = () => {
    if (language === 'ko') {
      if (isOrientationMode) {
        return "기기를 회전하여 작품을 감상하실 수 있습니다. 화면을 두 번 탭하면 각도 모드를 끌 수 있습니다.";
      }
      return "각도 모드가 꺼져 있습니다. 화면을 두 번 탭하면 각도 모드를 켤 수 있습니다.";
    } else {
      if (isOrientationMode) {
        return "You can view the artwork by rotating your device. Double tap to disable angle mode.";
      }
      return "Angle mode is off. Double tap to enable angle mode.";
    }
  };

  return (
    <div className="sr-only" aria-live="polite" role="status">
      {getStatusDescription()}
      {getActionGuide()}
    </div>
  );
};

export default ScreenReaderText; 