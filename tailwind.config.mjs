/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand red (matches PrintFast logo)
        brand: {
          50:  '#fff1f1',
          100: '#ffdfe0',
          200: '#ffc4c6',
          300: '#ff979b',
          400: '#ff5c63',
          500: '#fb2a35',
          600: '#ed1c24',
          700: '#c4131a',
          800: '#a3141a',
          900: '#87171c',
          950: '#4a060a',
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
          green:  '#2bb673',
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
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -12px rgba(237, 28, 36, 0.18)',
        'glow': '0 20px 60px -20px rgba(251, 42, 53, 0.55)',
      },
      backgroundImage: {
        'grid-light': "linear-gradient(rgba(237,28,36,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(237,28,36,0.06) 1px, transparent 1px)",
        'hero-radial': 'radial-gradient(1200px 600px at 80% -10%, rgba(237,28,36,0.22), transparent 60%), radial-gradient(900px 500px at 0% 20%, rgba(252,209,22,0.18), transparent 60%)',
        'spectrum': 'linear-gradient(90deg,#fcd116 0%,#2bb673 35%,#1e88e5 70%,#7e57c2 100%)',
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
