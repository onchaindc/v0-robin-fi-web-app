import type { Config } from 'tailwindcss'

const config: Config = {
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
          gray: '#a0a0a0',
          'gray-dark': '#5a5a5a',
          'gray-light': '#e8e8e8',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
