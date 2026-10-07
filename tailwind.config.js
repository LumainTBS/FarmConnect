/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0D4A2B',
          forest: '#135334',
          primary: '#1A7A48',
          emerald: '#166534',
          light: '#EBF7F0',
          surface: '#F8F9FA',
          accent: '#22C55E',
          cream: '#FAF9F6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
