import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nothing: {
          black: "#000000",
          surface: "#121214",
          surfaceElevated: "#1C1C1F",
          surfaceHover: "#18181B",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(255, 255, 255, 0.16)",
          textPrimary: "#FFFFFF",
          textSecondary: "#8E8E93",
          textMuted: "#636366",
          red: "#D71921",
          redMuted: "rgba(215, 25, 33, 0.15)",
          redGlow: "rgba(215, 25, 33, 0.4)",
          green: "#30D158",
          amber: "#FF9F0A",
          dotGrid: "#27272A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-space-mono)", "Space Mono", "JetBrains Mono", "monospace"],
        dot: ["var(--font-dot)", "DotGothic16", "monospace"],
      },
      borderRadius: {
        "3xl": "24px",
      },
      backgroundImage: {
        "dot-grid": "radial-gradient(#27272a 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-sm": "16px 16px",
        "dot-md": "24px 24px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.25s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
