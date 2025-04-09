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
        'vivid-blue': '#0072BB',
        'exhibition-bg': '#FFFFFF',
        'exhibition': {
          bg: '#FFFFFF',
          text: '#000000',
        },
        'page1-bg': '#6BFFA2',
        'page1-text': '#FF38A7',

        'page2-bg': '#FFF100',
        'page2-text': '#0072BB',  

        'page3-bg': '#26277D',
        'page3-text': '#00EA67', 

        'page4-bg': '#D0D0D0',
        'page4-text': '#FF5218',

        'page5-bg': '#534546',
        'page5-text': '#FF93F5',

        'page6-bg': '#A079DA',
        'page6-text': '#CCFF66',

        'page7-bg': '#4CFFF3',
        'page7-text': '#832ECA',

        'page8-bg': '#FFCAE6',
        'page8-text': '#044E00',

        'base-color': '#E4E4E4',
        'key-color': '#FF5218',
      },
      lineHeight: {
        'base': '170%',
        'relaxed': '175%',
      },
      keyframes: {
        'rotate-left': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'rotate-left': 'rotate-left 15s linear infinite',
        'fadeIn': 'fadeIn 2s ease-in forwards'
      },
      textShadow: {
        'stroke-thin': '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000',
        'stroke-medium': '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
        'stroke-thick': '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000',
        'stroke-white-thin': '-0.5px -0.5px 0 #fff, 0.5px -0.5px 0 #fff, -0.5px 0.5px 0 #fff, 0.5px 0.5px 0 #fff',
      },
      boxShadow: {
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
        'xl': '5px 15px 15px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.6)',
        '4xl': '0 45px 70px -18px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'key-gradient': 'linear-gradient(to left, #FFEA7B, #FACFB9)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-stroke-thin': {
          textShadow: '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000',
        },
        '.text-stroke-medium': {
          textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
        },
        '.text-stroke-thick': {
          textShadow: '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000',
        },
        '.text-stroke-white-thin': {
          textShadow: '-0.5px -0.5px 0 #fff, 0.5px -0.5px 0 #fff, -0.5px 0.5px 0 #fff, 0.5px 0.5px 0 #fff',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}; 