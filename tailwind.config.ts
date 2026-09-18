import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'Hanken Grotesk'", "system-ui", "sans-serif"],
        display: ["Archivo", "'Hanken Grotesk'", "system-ui", "sans-serif"],
      },
      /*
        Escala tipográfica SEM entrelinha embutida. No DS a altura de linha é
        `normal` por padrão e só vira número onde o texto quebra em várias
        linhas — por isso `text-sm` não pode arrastar 1.25rem junto. Quem
        precisa de respiro escreve `leading-*` explicitamente.
      */
      fontSize: {
        xs: ["0.75rem", "normal"],
        sm: ["0.875rem", "normal"],
        base: ["1rem", "normal"],
        lg: ["1.125rem", "normal"],
        xl: ["1.25rem", "normal"],
        "2xl": ["1.5rem", "normal"],
        "3xl": ["1.875rem", "normal"],
        "4xl": ["2.25rem", "normal"],
        "5xl": ["3rem", "normal"],
        "6xl": ["3.75rem", "normal"],
        "7xl": ["4.5rem", "normal"],
        "8xl": ["6rem", "normal"],
        "9xl": ["8rem", "normal"],
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
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
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
        // cores da família da marca (logo tally-check)
        brand: {
          pink: "hsl(var(--brand-pink))",
          cyan: "hsl(var(--brand-cyan))",
        },
        // rampa sequencial (magnitude) do heatmap de horários — um tom só, claro→escuro
        heat: {
          1: "hsl(var(--heat-1))",
          2: "hsl(var(--heat-2))",
          3: "hsl(var(--heat-3))",
          4: "hsl(var(--heat-4))",
          5: "hsl(var(--heat-5))",
          ink: "hsl(var(--heat-ink))",
        },
        // trilho/sidebar do shell — mais escuro que o card no dark
        panel: "hsl(var(--panel))",
        // 3º nível de texto: legendas, metadados, unidades
        faint: "hsl(var(--faint))",
        // superfície "tinta": cartões escuros mesmo no tema claro
        ink: {
          DEFAULT: "hsl(var(--ink))",
          foreground: "hsl(var(--ink-foreground))",
          border: "hsl(var(--ink-border))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-secondary": "var(--gradient-secondary)",
        "gradient-success": "var(--gradient-success)",
        "gradient-premium": "var(--gradient-premium)",
        "gradient-card": "var(--gradient-card)",
        "gradient-dark": "var(--gradient-dark)",
      },
      spacing: {
        // padding interno de cartão e gap entre cartões (densidade do DS)
        pad: "var(--pad)",
        gap: "var(--gap)",
      },
      borderRadius: {
        lg: "var(--radius)", // 9px — cartão, chip, pílula de período
        md: "calc(var(--radius) - 2px)", // 7px — item de navegação
        sm: "calc(var(--radius) - 4px)", // 5px
        tint: "6px", // quadrado de ícone
        btn: "12px", // botão, campo, trilho de abas
        pill: "14px", // botão grande / CTA
        rail: "15px", // botão do trilho de seções
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        premium: "var(--shadow-premium)",
        glow: "var(--shadow-glow)",
        elegant: "var(--shadow-elegant)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
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
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.55)" },
        },
        /* pontinho "ao vivo" — respira em vez de piscar */
        breathe: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".35", transform: "scale(.82)" },
        },
        /* entrada de item novo no feed */
        rise: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        /* celebração de marco */
        pop: {
          "0%": { transform: "scale(.7)", opacity: "0" },
          "60%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        glow: "glow 2s ease-in-out infinite",
        breathe: "breathe 2.2s ease-in-out infinite",
        rise: "rise 0.5s ease both",
        pop: "pop 0.5s cubic-bezier(.2,.9,.3,1.2)",
        float: "float 3.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
