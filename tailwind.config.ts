import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
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
