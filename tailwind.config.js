/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#222', // Đen không quá đen
        },
        white: '#fff',
      },
    },
  },
  plugins: [],
};
