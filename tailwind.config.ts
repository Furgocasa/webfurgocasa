import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Estrategia responsive: Mobile+Tablet (default) vs Desktop (1024px+)
    screens: {
      'sm': '640px',   // Mobile grande
      'md': '768px',   // Tablet
      'lg': '1024px',  // BREAKPOINT PRINCIPAL: Desktop
      'xl': '1280px',  // Desktop grande
      '2xl': '1536px', // Desktop muy grande
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-amiko)", "system-ui", "sans-serif"], // Amiko como fuente por defecto
        heading: ["var(--font-rubik)", "system-ui", "sans-serif"], // Rubik para títulos
        rubik: ["var(--font-rubik)", "system-ui", "sans-serif"],
        amiko: ["var(--font-amiko)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Colores corporativos Furgocasa
        furgocasa: {
          // Azul corporativo principal
          blue: {
            DEFAULT: "#063971", // Azul corporativo oficial
            dark: "#042A54",
            light: "#094F9A",
            50: "#E6F0FA",
            100: "#CCE0F5",
            200: "#99C2EB",
            300: "#66A3E0",
            400: "#3385D6",
            500: "#063971",
            600: "#053060",
            700: "#04264D",
            800: "#031D3B",
            900: "#021326",
          },
          // Naranja/Coral secundario - Optimizado para contraste WCAG AA
          orange: {
            DEFAULT: "#D65A31", // Naranja con contraste 4.5:1 sobre blanco (WCAG AA)
            dark: "#C04F2A",
            light: "#FF8C5F",
            bright: "#FF6B35", // Color original para fondos/decoración
            50: "#FFF3EE",
            100: "#FFE7DD",
            500: "#D65A31",
            600: "#C04F2A",
          },
          // Grises elegantes
          gray: {
            50: "#F8FAFC",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B",
            600: "#475569",
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          },
        },
        // Aliases para compatibilidad con código existente
        "furgocasa-blue": "#063971",
        "furgocasa-blue-dark": "#042A54",
        "furgocasa-blue-light": "#094F9A",
        "furgocasa-orange": "#D65A31", // Naranja con contraste WCAG AA
        "furgocasa-orange-dark": "#C04F2A",
        "furgocasa-orange-bright": "#FF6B35", // Color original para fondos/decoración
        "furgocasa-green": "#10B981",
        "furgocasa-yellow": "#FBBF24",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) translateX(0)", opacity: "0.6" },
          "50%": { transform: "translateY(-10px) translateX(5px)", opacity: "0.4" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-slow": "bounce-slow 3s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};

export default config;
