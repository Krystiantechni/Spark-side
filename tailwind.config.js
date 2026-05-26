/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // Custom fonts (preferowane → fallback)
      fontFamily: {
        // Display / hero — duże napisy bohaterskie (Orbitron ma pełne PL/latin-ext)
        display: ["Orbitron", "Azonix", "Urbanist", "ui-sans-serif", "system-ui"],
        // Brand — akcent, krótkie cytaty
        brand: ["Orbitron", "Urbanist", "serif"],
        // Body — paragrafy, opisy, UI
        sans: ["Urbanist", "Inter", "ui-sans-serif", "system-ui"],
        // Mono — kod, statystyki
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // Brand palette — neon noir z akcentami
        ink: {
          50: "#F5F5F7",
          100: "#E5E5EA",
          200: "#C7C7CC",
          300: "#8E8E93",
          400: "#48484A",
          500: "#1C1C1E",
          600: "#0A0A0F",
          700: "#050507",
          900: "#000000",
        },
        accent: {
          50: "#EAFCFF",
          100: "#B8F4FF",
          200: "#5BE9FF",
          300: "#00D9FF", // electric cyan
          400: "#00ABCC",
          500: "#007D99",
        },
        magenta: {
          300: "#FF3DC8",
          400: "#FF0080",
          500: "#CC0066",
        },
        lime: {
          300: "#C6FF00",
          400: "#A6E000",
        },
        gold: {
          300: "#F5C518",
          400: "#D9A400",
        },
      },
      backgroundImage: {
        "aurora": "radial-gradient(ellipse at top, rgba(0,217,255,0.18) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(255,0,128,0.18) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(198,255,0,0.12) 0%, transparent 50%)",
        "grid": "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        "grid-sm": "32px 32px",
        "grid-lg": "80px 80px",
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        "marquee-reverse": "marquee 30s linear infinite reverse",
        "spin-slow": "spin 12s linear infinite",
        gradient: "gradient 8s ease infinite",
        "scale-pulse": "scale-pulse 3s ease-in-out infinite",
        blob: "blob 14s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(2deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "scale-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        blob: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
      },
      boxShadow: {
        "neon-accent": "0 0 24px rgba(0,217,255,0.5), 0 0 60px rgba(0,217,255,0.25)",
        "neon-magenta": "0 0 24px rgba(255,0,128,0.5), 0 0 60px rgba(255,0,128,0.25)",
        "inner-glow": "inset 0 0 40px rgba(255,255,255,0.04)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
