import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#b9ddfe',
          300: '#7cc3fd',
          400: '#36a5fa',
          500: '#0c88eb',
          600: '#006ac9',
          700: '#0155a3',
          800: '#064986',
          900: '#0b3d6f',
          950: '#07264a',
        },
        clay: {
          50: '#fdf6ef',
          100: '#faead9',
          200: '#f4d2b2',
          300: '#ecb381',
          400: '#e28b4e',
          500: '#db6e2c',
          600: '#cc5622',
          700: '#a9411e',
          800: '#87351f',
          900: '#6d2d1c',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae3',
          300: '#b0bacb',
          400: '#8595ae',
          500: '#667894',
          600: '#51607a',
          700: '#424e63',
          800: '#3a4353',
          900: '#343b47',
          950: '#22262f',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.18)',
        lift: '0 2px 4px rgba(16,24,40,.04), 0 18px 40px -18px rgba(16,24,40,.28)',
        glow: '0 0 0 1px rgba(12,136,235,.12), 0 12px 40px -14px rgba(12,136,235,.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.22,1,.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
