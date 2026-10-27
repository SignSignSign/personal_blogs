/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mint: {
          50: '#f1fbf5',
          100: '#dcf6e3',
          200: '#b8ecc9',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        cream: {
          50: '#fbfdfb',
          100: '#f4f8f4',
          200: '#e8f0e8',
          300: '#d6e4d6',
        },
        sage: {
          50: '#f7fee7',
          500: '#65a30d',
          600: '#4d7c0f',
          700: '#365314',
          800: '#1a2e05',
        },
      },
      boxShadow: {
        soft: '0 2px 12px rgba(34, 197, 94, 0.08)',
        card: '0 4px 20px rgba(34, 197, 94, 0.06)',
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
};
