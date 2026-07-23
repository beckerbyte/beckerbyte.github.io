/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.html",
    "./src/partials/**/*.html",
    "./assets/js/**/*.js",
    "./scripts/**/*.mjs"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      boxShadow: {
        glow: "0 0 60px rgba(74, 222, 128, 0.12)"
      }
    }
  },
  plugins: []
};
