/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { brand: '#FF003C', brandHover: '#D00030' },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        serif: ['Oswald', 'sans-serif'],
        cursive: ['Oswald', 'sans-serif'],
      },
      borderRadius: {
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
      },
    },
  },
  plugins: [],
}
