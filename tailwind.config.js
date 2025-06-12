/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        whatsapp: {
          green: '#25d366',
          dark: '#075e54',
          light: '#dcf8c6',
          gray: '#f0f0f0',
          darkgray: '#2a2f32',
          blue: '#34b7f1'
        }
      }
    },
  },
  plugins: [],
}