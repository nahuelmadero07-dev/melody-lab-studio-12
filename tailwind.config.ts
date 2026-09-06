import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondo principal — violeta noche profundo
        night: {
          DEFAULT: "#1A1428",
          soft: "#251B3A",
          deep: "#0F0B1A",
        },
        // Texto blanco cálido (no puro)
        parchment: {
          DEFAULT: "#F5EFE0",
          muted: "#B4A8CC",
          dim: "#7A6E96",
        },
        // Acento principal — dorado cálido grabado
        gold: {
          DEFAULT: "#E9C46A",
          deep: "#C99A3B",
          soft: "#F3D998",
        },
        // Acento secundario — rosa polvo para elementos suaves
        rose: {
          dust: "#D4A5A5",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tighter2: "-0.035em",
      },
      maxWidth: {
        reading: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
