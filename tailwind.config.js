/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./src/**/*.{html,js}", "./index.html"],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '2rem',
      },
      // screens: {
      //   sm: '600px',
      //   md: '728px',
      //   lg: '984px',
      //   xl: '1240px',
      //   '2xl': '1496px',
      // },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'gray-light': '#f2f2f5',
      },
    },
  },
  plugins: [],
}
