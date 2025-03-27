/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      rotate: {
        '15': '15deg',
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
      fontWeight: {
        semibold: 600,
      },
      colors: {
        'vivid-blue': '#000000', // 순수한 파란색 (채도 100%)
        'vivid-yellow': '#FFFFFF', // 순수한 노란색 (채도 100%)
        'exhibition': {
          bg: '#FFFFFF', // 배경색
          text: '#000000', // 텍스트 색상
        }
      },
      lineHeight: {
        'base': '170%',  // 기본 행간을 170%로 설정
      },
    },
  },
  plugins: [],
} 