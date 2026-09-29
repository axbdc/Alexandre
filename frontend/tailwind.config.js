/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Cabinet Grotesk"', '"Satoshi"', "sans-serif"],
                sans: ['"Satoshi"', "system-ui", "sans-serif"],
                serif: ['"Newsreader"', "serif"],
            },
            colors: {
                // Cores ligadas a variáveis CSS (index.css). O site público usa o
                // tema escuro (.theme-dark); o admin continua com o tema claro.
                bone: "rgb(var(--c-bone) / <alpha-value>)",
                pebble: "rgb(var(--c-pebble) / <alpha-value>)",
                sand: "rgb(var(--c-sand) / <alpha-value>)",
                ink: "rgb(var(--c-ink) / <alpha-value>)",
                graphite: "rgb(var(--c-graphite) / <alpha-value>)",
                mist: "rgb(var(--c-mist) / <alpha-value>)",
                terracotta: {
                    DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",
                    hover: "rgb(var(--c-accent-hover) / <alpha-value>)",
                },
                hairline: "rgb(var(--c-hairline) / <alpha-value>)",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
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
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
