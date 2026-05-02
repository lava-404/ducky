import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        accent: '#01d6ce',
      },
    },
  },
  plugins: [],
}

export default config