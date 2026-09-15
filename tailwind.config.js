/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // SooqRoot green — the core identity, deepened for a premium B2B feel
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
          950: '#0d2419',
        },
        // Desert sand — secondary warm accent
        sand: {
          50: '#fbf7f0',
          100: '#f5ecd9',
          200: '#ecd9b3',
          300: '#dcba7e',
          400: '#c99c57',
          500: '#b07f3e',
          600: '#8d6430',
        },
        charcoal: {
          50: '#f7f8f8',
          100: '#eceeee',
          200: '#d9dcdd',
          300: '#b3b8ba',
          400: '#848a8e',
          500: '#5f666a',
          600: '#454b4e',
          700: '#313638',
          800: '#1e2224',
          900: '#121517',
          950: '#0a0c0d',
        },
        // Off-white canvas
        canvas: {
          DEFAULT: '#fafbfa',
          soft: '#f5f7f5',
          warm: '#faf9f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        ar: ['"Noto Naskh Arabic"', '"Cairo"', 'Tahoma', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(18,21,23,0.04), 0 4px 16px rgba(18,21,23,0.05)',
        card: '0 1px 2px rgba(18,21,23,0.03), 0 1px 3px rgba(18,21,23,0.04)',
        lift: '0 2px 4px rgba(18,21,23,0.04), 0 12px 32px rgba(18,21,23,0.08)',
        glow: '0 0 0 1px rgba(60,140,97,0.14), 0 8px 28px rgba(60,140,97,0.14)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1d4733 0%, #2a714c 55%, #3c8c61 100%)',
        'brand-mesh':
          'radial-gradient(at 0% 0%, rgba(60,140,97,0.10) 0px, transparent 55%), radial-gradient(at 100% 0%, rgba(201,156,87,0.08) 0px, transparent 50%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        in: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        dash: { to: { strokeDashoffset: '-24' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        grow: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        in: 'in 260ms cubic-bezier(0.16,1,0.3,1) both',
        fade: 'fade 400ms ease-out both',
        pulseRing: 'pulseRing 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
        dash: 'dash 1s linear infinite',
        shimmer: 'shimmer 1.8s infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
