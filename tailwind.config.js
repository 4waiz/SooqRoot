/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f8f3',
          100: '#dcefe1',
          200: '#badec7',
          300: '#8dc6a4',
          400: '#5ca87e',
          500: '#3c8c61',
          600: '#2a714c',
          700: '#22593e',
          800: '#1d4733',
          900: '#183b2b',
        },
        sand: {
          50: '#fbf7f0',
          100: '#f5ecd9',
          200: '#ecd9b3',
          300: '#dcba7e',
          400: '#c99c57',
          500: '#b07f3e',
        },
        charcoal: {
          50: '#f4f5f5',
          100: '#e4e5e6',
          200: '#c6c8ca',
          300: '#9ea1a5',
          400: '#70757a',
          500: '#555a5f',
          600: '#3f4346',
          700: '#2b2e31',
          800: '#1a1c1e',
          900: '#0f1012',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        ar: ['"Noto Naskh Arabic"', '"Cairo"', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(15, 16, 18, 0.04), 0 8px 24px rgba(15, 16, 18, 0.06)',
        glow: '0 0 0 1px rgba(60,140,97,0.12), 0 10px 40px rgba(60,140,97,0.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2a714c 0%, #3c8c61 50%, #8dc6a4 100%)',
        'sand-gradient': 'linear-gradient(135deg, #f5ecd9 0%, #ecd9b3 100%)',
      },
    },
  },
  plugins: [],
};
