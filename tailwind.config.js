/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "#FBFBFA",
        charcoal: {
          900: "#091412",
          800: "#0E1F1C",
          700: "#182E2A",
          600: "#24423C",
          500: "#365952",
        },
        emerald: {
          900: "#063A22",
          800: "#0A5C36",
          700: "#0D7A48",
          600: "#10985A",
          500: "#13B66C",
          400: "#34D399",
          100: "#E2ECE6",
          50: "#F0F6F2",
        },
        sage: {
          50: "#F7FAF8",
          100: "#EBF2EE",
          200: "#D7E4DC",
          300: "#B8CEC1",
          400: "#92B1A0",
          500: "#709481",
        },
        amber: {
          500: "#E08A26",
          400: "#F59E0B",
          100: "#FEF3C7",
          50: "#FFFBEB",
        },
        muted: "#526661",
        subtle: "#7F9690",
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(14, 31, 28, 0.04), 0 10px 30px rgba(14, 31, 28, 0.03)",
        card: "0 4px 20px -2px rgba(14, 31, 28, 0.05), 0 2px 6px -1px rgba(14, 31, 28, 0.03)",
        elevated: "0 20px 40px -10px rgba(14, 31, 28, 0.08)",
        glow: "0 0 50px -10px rgba(13, 122, 72, 0.15)",
        dome: "0 30px 100px 30px rgba(16, 152, 90, 0.12)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
