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
        serif: ['Noto Serif KR', 'serif'],
      },
      fontWeight: {
        semibold: 600,
      },
      colors: {
        'vivid-blue': '#YOUR_COLOR_CODE_HERE', // 원하는 색상 코드로 변경
        'exhibition-bg': '#YOUR_COLOR_CODE_HERE', // 다른 커스텀 색상들도 여기에 추가
        'exhibition': {
          bg: '#FFFFFF', // 배경색
          text: '#000000', // 텍스트 색상
        }
      },
      lineHeight: {
        'base': '170%',  // 기본 행간을 170%로 설정
      },
      text: {
        'lg': '1.15rem',
      },
      keyframes: {
        'rotate-left': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' }
        }
      },
      animation: {
        'rotate-left': 'rotate-left 10s linear infinite'
      }
    },
  },
  plugins: [],
} 