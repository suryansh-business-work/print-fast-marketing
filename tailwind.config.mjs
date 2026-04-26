/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand green (anchored on #6FD12E)
        brand: {
          50:  '#f3fbe8',
          100: '#e2f7c8',
          200: '#c8ee98',
          300: '#a8e264',
          400: '#8bd942',
          500: '#6FD12E',
          600: '#58b022',
          700: '#44881d',
          800: '#366d1d',
          900: '#2d5a1c',
          950: '#14310a',
        },
        // Vibrant accent (yellow from rainbow bar)
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Rainbow palette taken from logo bar
        spectrum: {
          yellow: '#fcd116',
          green:  '#6FD12E',
          blue:   '#1e88e5',
          purple: '#7e57c2',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e1',
          300: '#b1b8c5',
          400: '#8690a3',
          500: '#677188',
          600: '#525a70',
          700: '#43495b',
          800: '#2a2f3d',
          900: '#16181f',
          950: '#0b0d13',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -12px rgba(111, 209, 46, 0.20)',
        'glow': '0 20px 60px -20px rgba(111, 209, 46, 0.55)',
      },
      backgroundImage: {
        'grid-light': "linear-gradient(rgba(111,209,46,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(111,209,46,0.07) 1px, transparent 1px)",
        'hero-radial': 'radial-gradient(1200px 600px at 80% -10%, rgba(111,209,46,0.22), transparent 60%), radial-gradient(900px 500px at 0% 20%, rgba(252,209,22,0.18), transparent 60%)',
        'spectrum': 'linear-gradient(90deg,#fcd116 0%,#6FD12E 35%,#1e88e5 70%,#7e57c2 100%)',
      },
      backgroundSize: {
        'grid-32': '32px 32px',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
