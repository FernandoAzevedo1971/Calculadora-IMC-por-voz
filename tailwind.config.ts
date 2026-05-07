import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,.08)',
        glow: '0 0 0 8px rgb(var(--primary) / 0.15)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      }
    }
  },
  plugins: []
} satisfies Config;
