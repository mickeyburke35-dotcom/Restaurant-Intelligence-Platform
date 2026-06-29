import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f7f2",
        ink: "#16201f",
        muted: "#5f6f6a",
        pine: "#1f6b5d",
        steel: "#355d75"
      }
    }
  },
  plugins: []
};

export default config;
