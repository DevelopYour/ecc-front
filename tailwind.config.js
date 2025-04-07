/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        c: {
          beige: '#f3eee9',
          green: '#3c5d5d',
          greenLight: '#4f7c7c',
          gray: '#4b5563',
        },
      },
    },
  },
  plugins: [],
}
