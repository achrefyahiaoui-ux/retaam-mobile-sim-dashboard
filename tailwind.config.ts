import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0E26",
          900: "#0F1535",
          800: "#1A2150",
          700: "#2A3270",
          500: "#5E6BA8",
          300: "#A5AEDC",
        },
        cream: {
          50: "#FBF8F1",
          100: "#F7F3EA",
          200: "#EDE6D3",
          300: "#DCD0B0",
        },
        signal: {
          DEFAULT: "#FF6B3D",
          dark: "#E5552A",
          glow: "#FF8A63",
        },
        teal: {
          DEFAULT: "#00C2A8",
          dark: "#00A38E",
          glow: "#3DD9C2",
        },
        amber: {
          DEFAULT: "#FFB547",
        },
        plum: {
          DEFAULT: "#A66DD4",
        },
      },
      fontFamily: {
        sans: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
        num: ['var(--font-dm)', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 21, 53, 0.04), 0 8px 24px rgba(15, 21, 53, 0.06)",
        card: "0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,21,53,0.05), 0 12px 32px -8px rgba(15,21,53,0.15)",
        glow: "0 0 0 1px rgba(255, 107, 61, 0.25), 0 12px 28px -8px rgba(255, 107, 61, 0.45)",
      },
      backgroundImage: {
        'grid-fade': "radial-gradient(ellipse at top, rgba(255,255,255,0.18), transparent 60%)",
        'signal-gradient': "linear-gradient(135deg, #FF6B3D 0%, #FFB547 100%)",
        'teal-gradient': "linear-gradient(135deg, #00C2A8 0%, #3DD9C2 100%)",
      },
      animation: {
        shimmer: "shimmer 1.8s ease-in-out infinite",
        pulse_dot: "pulse_dot 2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse_dot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.85)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
