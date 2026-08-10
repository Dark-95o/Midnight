/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0A0B0E",
        cyberCyan: "#06B6D4",
        midnightViolet: "#6D28D9",
      },
    },
  },
  plugins: [],
}
