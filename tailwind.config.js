/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#166EA8", dark: "#0f4f7a", light: "#419DA2" },
        surface: "#f8fafc",
        border: "#e2e8f0",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem" },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.05), 0 4px 24px rgba(0,0,0,0.04)",
        modal: "0 8px 40px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
}
