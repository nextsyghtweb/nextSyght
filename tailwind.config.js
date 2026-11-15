/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Poppins is loaded from Google Fonts in index.html.
        // To use Montserrat instead, change the font link in index.html and swap the order here.
        sans: ['Poppins', 'Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dark navy surfaces
        navy: {
          950: '#050816',
          900: '#070b1f',
          800: '#0b1230',
          700: '#111a40',
          600: '#1a2557',
        },
        // Brand accents: electric blue, violet, cyan
        brand: {
          blue: '#2f6bff',
          violet: '#8b5cf6',
          cyan: '#22d3ee',
        },
      },
      // Extra opacity steps used for subtle borders/text (e.g. text-white/65)
      opacity: { 15: '0.15', 35: '0.35', 45: '0.45', 55: '0.55', 65: '0.65' },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #22d3ee 0%, #2f6bff 50%, #8b5cf6 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg, rgba(34,211,238,.18) 0%, rgba(47,107,255,.18) 50%, rgba(139,92,246,.18) 100%)',
      },
      boxShadow: {
        glow: '0 10px 34px -8px rgba(47, 107, 255, 0.6)',
        'glow-violet': '0 10px 34px -8px rgba(139, 92, 246, 0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translate3d(0, 24px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(0, -22px, 0) rotate(8deg)' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '80%, 100%': { transform: 'scale(1.7)', opacity: '0' },
        },
        shimmer: {
          '0%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
          '100%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(.2,.7,.2,1) both',
        float: 'float 9s ease-in-out infinite',
        'ping-slow': 'ping-slow 2.6s cubic-bezier(0,0,.2,1) infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
