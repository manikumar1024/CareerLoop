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
        canvas: "#F7F3EB",
        charcoal: {
          900: "#1A110C",
          800: "#2A1C15",
          700: "#3F2B21",
          600: "#573D30",
          500: "#705242",
        },
        emerald: {
          950: "#1C100A",
          900: "#2B180E",
          800: "#442718",
          700: "#5D3723",
          600: "#78472E",
          500: "#965C3D",
          400: "#B67B58",
          300: "#D19F7E",
          200: "#E6C5AA",
          100: "#F1DEC9",
          50: "#FAF3EA",
        },
        brown: {
          950: "#1C100A",
          900: "#2B180E",
          800: "#442718",
          700: "#5D3723",
          600: "#78472E",
          500: "#965C3D",
          400: "#B67B58",
          300: "#D19F7E",
          200: "#E6C5AA",
          100: "#F1DEC9",
          50: "#FAF3EA",
        },
        sage: {
          50: "#FAF7F2",
          100: "#F4EFE6",
          200: "#E9DFCF",
          300: "#D8C9B3",
          400: "#BAA78E",
          500: "#948067",
        },
        beige: {
          50: "#FAF7F2",
          100: "#F4EFE6",
          200: "#E9DFCF",
          300: "#D8C9B3",
          400: "#BAA78E",
          500: "#948067",
        },
        amber: {
          500: "#C4792C",
          400: "#DE903E",
          100: "#FDF0DB",
          50: "#FEF9F0",
        },
        muted: "#786153",
        subtle: "#9E8779",
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(42, 28, 21, 0.05), 0 10px 30px rgba(42, 28, 21, 0.03)",
        card: "0 4px 20px -2px rgba(42, 28, 21, 0.06), 0 2px 6px -1px rgba(42, 28, 21, 0.03)",
        elevated: "0 20px 40px -10px rgba(42, 28, 21, 0.1)",
        glow: "0 0 50px -10px rgba(93, 55, 35, 0.22)",
        dome: "0 30px 100px 30px rgba(120, 71, 46, 0.12)",
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
