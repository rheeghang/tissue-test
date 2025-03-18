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
        'vivid-blue': '#0000FF', // 순수한 파란색 (채도 100%)
        'vivid-yellow': '#FFFF00', // 순수한 노란색 (채도 100%)
        'exhibition': {
          bg: '#0000FF', // 배경색
          text: '#FFFF00', // 텍스트 색상
        }
      }
    },
  },
  plugins: [],
} 