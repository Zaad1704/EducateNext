/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#1E40AF',
        },
        accent: '#F97316',
        neutral: {
          50: '#F9FAFB',
          100: '#FFFFFF',
          900: '#111827',
          600: '#6B7280',
          200: '#E5E7EB',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(16 24 40 / 0.05)',
        md: '0 4px 6px -1px rgb(16 24 40 / 0.07)',
      },
    },
  },
  plugins: [],
};