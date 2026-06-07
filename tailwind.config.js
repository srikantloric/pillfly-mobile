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
          'savings-header': '#106853',
          'savings-gold': '#F5C842',
          'promo-pink': '#FCE7F3',
          'promo-red': '#BE123C',
          'icon-green': '#16A34A',
          'banner-cta': '#1E3A8A',
          auth: {
            primary: '#0B9444',
            light: '#8EDB92',
            soft: '#EAF8EC',
            ink: '#1F2937',
            muted: '#6B7280',
            'gradient-start': '#76C859',
            'gradient-end': '#0B9444',
          },
        },
      },
    },
  },
  plugins: [],
};
