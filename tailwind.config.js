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
          bg: '#000000', // 배경색
          text: '#FFFFFF', // 텍스트 색상
        }
      }
    },
  },
  plugins: [],
} 