/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "finsight-bg": "#0a0f1b",
        "finsight-surface": "#1a2030",
        "finsight-cyan": "#00c8ff",
        "finsight-purple": "#8a2be2",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
    },
  },
  plugins: [],
};
