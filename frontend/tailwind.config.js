/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // iOS 16+ стиль
        ios: {
          bg: '#000000',
          card: '#1C1C1E',
          cardSecondary: '#2C2C2E',
          primary: '#0A84FF',
          green: '#30D158',
          red: '#FF453A',
          yellow: '#FFD60A',
          orange: '#FF9500',
          gray: '#8E8E93',
          graySecondary: '#636366',
          separator: '#38383A',
          blue: '#5AC8FA',
          purple: '#BF5AF2',
          pink: '#FF375F',
          teal: '#64D2FF',
        },
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '20px',
        'ios-xl': '28px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'ios': '0 1px 3px rgba(0,0,0,0.3)',
        'ios-lg': '0 4px 12px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
