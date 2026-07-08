import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edfafa',
          100: '#c9f0ee',
          200: '#8edbd8',
          500: '#18aaa5',
          600: '#0e8f90',
          700: '#0a6d78',
          800: '#075563',
          900: '#063f4d',
        },
        aqua: '#1bafa9',
        petrol: '#075563',
        skyglass: '#f3fbfa',
      },
      boxShadow: {
        soft: '0 20px 50px rgba(6, 63, 77, 0.13)',
        glow: '0 24px 70px rgba(24, 170, 165, 0.24)',
      },
    },
  },
  plugins: [],
} satisfies Config
