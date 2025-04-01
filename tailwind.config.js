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
        },
        'page1-bg': '#6BFFA2',  // 연두색
        'page1-text': '#FF38A7',  // 핑크
        'page2-bg': '#FFF100',  // 노란색
        'page2-text': '#000000',  // 검정
        'page3-bg': '#26277D',  // 진한 파란색
        'page3-text': '#FFFFFF',  // 흰색

        'key-color': '#FF5218',
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
        'rotate-left': 'rotate-left 15s linear infinite'
      },
      textShadow: {
        'stroke-thin': '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000',
        'stroke-medium': '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
        'stroke-thick': '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000',
        'stroke-white-thin': '-0.5px -0.5px 0 #fff, 0.5px -0.5px 0 #fff, -0.5px 0.5px 0 #fff, 0.5px 0.5px 0 #fff',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-stroke-thin': {
          textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
        },
        '.text-stroke-medium': {
          textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
        },
        '.text-stroke-thick': {
          textShadow: '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000',
        },
        '.text-stroke-white-thin': {
          textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
} 