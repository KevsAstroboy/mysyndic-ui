import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-2": "rgb(var(--ink-2) / <alpha-value>)",
        "ink-3": "rgb(var(--ink-3) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        overlay: "rgb(var(--overlay) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          light: "rgb(var(--primary-light) / <alpha-value>)",
          mid: "rgb(var(--primary-mid) / <alpha-value>)",
          dark: "rgb(var(--primary-dark) / <alpha-value>)",
        },
        accent: "rgb(var(--accent) / <alpha-value>)",
        emerald: {
          DEFAULT: "rgb(var(--emerald) / <alpha-value>)",
          soft: "rgb(var(--emerald-soft) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--gold) / <alpha-value>)",
          soft: "rgb(var(--gold-soft) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--red) / <alpha-value>)",
          soft: "rgb(var(--red-soft) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--info) / <alpha-value>)",
          soft: "rgb(var(--info-soft) / <alpha-value>)",
        },
        purple: {
          DEFAULT: "rgb(var(--purple) / <alpha-value>)",
          soft: "rgb(var(--purple-soft) / <alpha-value>)",
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
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
        fab: "var(--shadow-fab)",
        btn: "var(--shadow-btn)",
      },
    },
  },
  plugins: [],
};

export default config;