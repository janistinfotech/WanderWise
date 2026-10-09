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
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102A43', // Deep Ocean Navy
          950: '#0b1c2e',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0D9488', // Tropical Teal
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        coral: {
          50: '#fff5f2',
          100: '#ffe8e2',
          200: '#ffd4c7',
          300: '#ffb5a1',
          400: '#ff987d',
          500: '#FF8066', // Warm Coral
          600: '#f05f40',
          700: '#d94424',
          800: '#b83218',
          900: '#8a200d',
        },
        ivory: {
          50: '#fdfcfb',
          100: '#FAF9F6', // Soft Ivory
          200: '#f5f2eb',
          300: '#eee9dd',
          400: '#e0d8c3',
        },
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          bg: '#0A1322',
          surface: '#101F35',
          card: '#162844',
          border: '#233A5E',
          muted: '#8B9DB7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(16, 42, 67, 0.05)',
        'card': '0 12px 35px -4px rgba(16, 42, 67, 0.09)',
        'float': '0 20px 40px -8px rgba(16, 42, 67, 0.15)',
        'glow-teal': '0 0 25px -4px rgba(13, 148, 136, 0.35)',
        'glow-coral': '0 0 25px -4px rgba(255, 128, 102, 0.35)',
      }
    },
  },
  plugins: [],
}
