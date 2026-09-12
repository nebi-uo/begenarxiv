/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F4F3F1',
        card: '#FFFFFF',
        ink: '#1A1A1A',
        muted: '#8A8A8A',
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};