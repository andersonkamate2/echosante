import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#050505',
          900: '#111111',
          100: '#f5f5f5',
        },
      },
      boxShadow: {
        soft: '0 20px 60px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
