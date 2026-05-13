/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Mirror src/theme/colors.ts
        pillfly: {
          background: '#F5F6FA',
          surface: '#FFFFFF',
          ink: '#0F172A',
          muted: '#64748B',
          line: '#E2E8F0',
          primary: '#0D9488',
          'brand-teal': '#0F766E',
          'brand-teal-dark': '#0D5C56',
          'brand-purple': '#5B21B6',
          section: '#0F5C4F',
          'promo-pink': '#FCE7F3',
          'promo-red': '#BE123C',
        },
      },
    },
  },
  plugins: [],
};
