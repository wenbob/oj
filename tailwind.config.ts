import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#161713",
          800: "#35382f",
          600: "#6c705f",
        },
        linen: "#f7f3ea",
        moss: "#6f7d45",
        clay: "#b66b41",
        steel: "#4f6f88",
      },
      boxShadow: {
        line: "inset 0 -1px 0 rgba(22, 23, 19, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
