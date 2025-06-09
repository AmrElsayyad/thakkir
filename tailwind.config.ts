import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["Amiri", "Noto Sans Arabic", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        border: "var(--border)",
        ring: "var(--ring)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "pulse-emerald": "pulse-emerald 2s infinite",
        "celebrate": "celebrate 0.6s ease-in-out",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "pulse-emerald": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(5, 150, 105, 0.7)",
          },
          "50%": {
            boxShadow: "0 0 0 15px rgba(5, 150, 105, 0)",
          },
        },
        celebrate: {
          "0%, 100%": {
            transform: "scale(1) rotate(0deg)",
          },
          "25%": {
            transform: "scale(1.1) rotate(-5deg)",
          },
          "75%": {
            transform: "scale(1.1) rotate(5deg)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
      boxShadow: {
        "3xl": "0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
};

export default config; 