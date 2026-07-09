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
        canvas: "#F6F3EE",
        panel: "#FBFAF7",
        snow: "#FDFCF9",
        ink: "#26343B",
        muted: "#647178",
        subtle: "#928A82",
        line: "#DCD4CA",
        pine: "#3F5E4D",
        "pine-dark": "#31493D",
        lichen: "#D9EA75",
        positive: "#3F6F52",
        neutral: "#8B9497",
        negative: "#B84A4A",
        mixed: "#B9842E"
      },
      boxShadow: {
        soft: "0 10px 24px rgb(38 52 59 / 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
