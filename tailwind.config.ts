/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#059669",
          dark: "#047857",
          light: "#34d399",
          50: "#ecfdf5",
          100: "#d1fae5",
          600: "#059669",
          700: "#047857",
        },
        sidebar: {
          DEFAULT: "#064e3b",
          active: "#047857",
          hover: "rgba(255,255,255,0.07)",
          text: "rgba(255,255,255,0.65)",
          icon: "rgba(255,255,255,0.5)",
        },
        surface: "#f8fafb",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 4px rgba(5,150,105,0.04), 0 4px 20px rgba(5,150,105,0.06)",
        "card-hover": "0 4px 24px rgba(5,150,105,0.12), 0 1px 4px rgba(5,150,105,0.06)",
        modal: "0 8px 40px rgba(6,78,59,0.18)",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
