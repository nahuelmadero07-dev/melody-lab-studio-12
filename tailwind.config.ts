import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // === Paleta VIEJA (se mantiene para /crear y /escuchar) ===
        paper: {
          DEFAULT: "#F7F0DC",
          warm: "#F2E8CF",
          deep: "#EBDFC0",
        },
        ink: {
          DEFAULT: "#1F1810",
          soft: "#4A3D2E",
          dim: "#6B5847",
          faint: "#9B8A75",
        },
        gold: {
          DEFAULT: "#B8863E",
          deep: "#8E6628",
          soft: "#D4A95C",
        },
        lacre: {
          DEFAULT: "#8E2A2A",
          deep: "#6B1F1F",
        },
        // === Paleta NUEVA (home v2) ===
        ebony: {
          DEFAULT: "#0E0A0C",
          soft: "#1A1216",
          card: "#231A1E",
          deep: "#0A0708",
        },
        cream: {
          DEFAULT: "#F5E8CF",
          dim: "#A89A83",
          faint: "#6B5E54",
        },
        rose: {
          DEFAULT: "#F0416C",
          deep: "#C32B52",
        },
        gold2: {
          DEFAULT: "#D4A74A",
          deep: "#8B6B2E",
        },
        wa: "#25D366",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        hand: ["var(--font-caveat)", "cursive"],
      },
      letterSpacing: {
        titulo: "-0.025em",
      },
      maxWidth: {
        lectura: "62ch",
      },
    },
  },
  plugins: [],
};

export default config;
