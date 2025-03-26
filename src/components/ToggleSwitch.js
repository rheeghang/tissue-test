import React from 'react';

const ToggleSwitch = ({ isOn, onToggle }) => {
  return (
    <div className="flex items-center justify-center">
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          isOn ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isOn ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="ml-2 text-sm text-gray-700">
        {isOn ? '각도 모드 켜짐' : '각도 모드 꺼짐'}
      </span>
    </div>
  );
};

export default ToggleSwitch; 