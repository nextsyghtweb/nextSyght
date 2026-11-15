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
        // Warm black and beige theme
        navy: {
          950: '#171717',
          900: '#292524',
          800: '#292524',
          700: '#292524',
          600: '#292524',
        },
        // Brand accents retain their semantic names for component compatibility.
        brand: {
          blue: '#D6C2A1',
          violet: '#D6C2A1',
          cyan: '#D6C2A1',
        },
      },
      // Extra opacity steps used for subtle borders/text (e.g. text-white/65)
      opacity: { 15: '0.15', 35: '0.35', 45: '0.45', 55: '0.55', 65: '0.65' },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #F5EDE0 0%, #D6C2A1 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg, rgba(245,237,224,.18) 0%, rgba(214,194,161,.18) 100%)',
      },
      boxShadow: {
        glow: '0 10px 34px -8px rgba(214, 194, 161, 0.45)',
        'glow-violet': '0 10px 34px -8px rgba(214, 194, 161, 0.35)',
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
