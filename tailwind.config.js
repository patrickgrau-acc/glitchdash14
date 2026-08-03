/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary, #6200ee)",
        accent: "var(--accent, #03dac6)",
        surface: "var(--surface, #121212)",
        "surface-alt": "var(--surface-alt, #1e1e1e)",
        border: "var(--border, #2d2d2d)",
        text: "var(--text, #e0e0e0)",
        "text-muted": "var(--text-muted, #9e9e9e)",
        success: "var(--success, #4caf50)",
        warning: "var(--warning, #ff9800)",
        danger: "var(--danger, #f44336)",
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
    },
  },
  plugins: [],
};
