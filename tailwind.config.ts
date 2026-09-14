import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F7F4",
        surface: "#FFFFFF",
        "surface-2": "#F0F3F0",
        ink: "#0F1E2D",
        "ink-2": "#3A5068",
        "ink-3": "#8BA4B8",
        border: "#E2EAE7",
        primary: {
          DEFAULT: "#0D6E5A",
          light: "#E6F5F1",
          dark: "#083D31",
        },
        emerald: {
          DEFAULT: "#00A87C",
          soft: "#DDFAF0",
        },
        gold: {
          DEFAULT: "#E8A020",
          soft: "#FEF3DC",
        },
        danger: {
          DEFAULT: "#E8453C",
          soft: "#FDECEA",
        },
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        pill: "999px",
      },
      fontFamily: {
        sans: [
          "var(--font-jakarta)",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 4px rgba(13,110,90,.06), 0 4px 16px rgba(13,110,90,.07)",
        float: "0 8px 32px rgba(13,110,90,.14)",
        fab: "0 6px 24px rgba(232,69,60,.42)",
        btn: "0 2px 8px rgba(13,110,90,.25)",
      },
    },
  },
  plugins: [],
};

export default config;
