import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        parchment: "rgb(var(--parchment) / <alpha-value>)",
        ember: "rgb(var(--ember) / <alpha-value>)",
        glow: "rgb(var(--glow) / <alpha-value>)",
        moss: "rgb(var(--moss) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        rune: "0 0 40px rgb(var(--ember) / 0.28), inset 0 0 40px rgb(var(--glow) / 0.08)",
        hud: "0 18px 50px rgb(0 0 0 / 0.45)",
      },
      backgroundImage: {
        shrine:
          "radial-gradient(1200px 600px at 10% -10%, rgb(var(--glow) / 0.18), transparent), radial-gradient(900px 500px at 110% 10%, rgb(var(--ember) / 0.16), transparent)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 3.2s ease-in-out infinite",
        floaty: "floaty 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
