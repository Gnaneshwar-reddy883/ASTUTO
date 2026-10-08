import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        primary: "var(--color-primary)",
        "primary-foreground": "var(--color-primary-foreground)",
        lavender: "var(--color-lavender)",
        mint: "var(--color-mint)",
        peach: "var(--color-peach)",
        progress: "var(--color-progress)",
        "progress-strong": "var(--color-progress-strong)",
        streak: "var(--color-streak)",
        overlay: "var(--color-overlay)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        pill: "var(--radius-pill)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-up": "slide-up 320ms ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
