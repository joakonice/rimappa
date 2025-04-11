/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        primary: {
          400: '#FF4B91',
          500: '#9C27B0',
          600: '#8B0037',
          700: '#4B0082',
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--primary-gradient)',
        'gradient-secondary': 'var(--secondary-gradient)',
      },
    },
  },
  plugins: [],
} 