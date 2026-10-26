/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        panel: '#0a0a0a',
        cyan: '#ff2a85',
        electric: '#d41468',
        magenta: '#ff2a85',
        muted: '#8a93a6',
      },
      fontFamily: {
        display: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(255, 42, 133, 0.4)',
        'glow-pink': '0 0 20px rgba(255, 42, 133, 0.4)',
      },
      backgroundImage: {
        'arena-grid': 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
        'arena-gradient': 'linear-gradient(110deg, #ff2a85 0%, #8b0046 52%, #050505 100%)',
      },
    },
  },
  plugins: [],
};
