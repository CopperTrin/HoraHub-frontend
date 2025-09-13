/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: {
          100: '#211A3A',
          200: '#140E25',
        },
        secondary: {
          100: '#BE3DFC',
          200: '#7431FA',
        },
        accent: {
          100: '#F6F683',
          200: '#FFD824',
        },
        blackpearl: '#0D1C2B',
        alabaster: '#F8F8F8',
        
      }
    },
  },
  plugins: [],
}