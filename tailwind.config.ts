import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        robin: {
          dark: '#0a0e14',
          darker: '#060809',
          teal: '#00d4aa',
          'teal-dark': '#00a881',
          'teal-light': '#33e0b8',
          pink: '#ff6b9d',
          gray: '#a0a0a0',
          'gray-dark': '#5a5a5a',
          'gray-light': '#e8e8e8',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backdropBlur: {
        xl: '16px',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 170, 0.8)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
