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
        wt: {
          bg: "#11161D",
          panel: "#171E27",
          elevated: "#1E2733",
          border: "#2E4259",
          borderHover: "#4A6B8F",
          slotStart: "#1F2D3D",
          slotEnd: "#18222E",
          slotHover: "#3B82F6",
          premiumStart: "#3A2E14",
          premiumEnd: "#261E0D",
          premiumBorder: "#D49B27",
          premiumGold: "#F5B841",
          squadronStart: "#193322",
          squadronEnd: "#112217",
          squadronBorder: "#2E6F40",
          squadronGreen: "#4ADE80",
          eventStart: "#2E1D2B",
          eventEnd: "#1D141C",
          eventBorder: "#6E3B64",
          orange: "#F57C00",
          orangeDark: "#E65100",
          action: "#FF8A00",
          gold: "#F5B841",
          cyan: "#38BDF8",
          green: "#22C55E",
          red: "#EF4444",
          textPrimary: "#FFFFFF",
          textSecondary: "#94A3B8",
          textMuted: "#64748B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-space-mono)", "Space Mono", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "wt": "10px",
        "wt-lg": "16px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.2s ease-out forwards",
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
