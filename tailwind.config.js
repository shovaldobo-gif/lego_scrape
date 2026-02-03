/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lego: {
          yellow: '#FFCD00',
          red: '#E3000B',
          blue: '#006DB7',
          green: '#00963E',
          orange: '#F57D20',
          black: '#1A1A1A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
