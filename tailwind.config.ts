import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: { DEFAULT: "#7A1F2B", dark: "#5A1620" },
        gold: { DEFAULT: "#C9A227", light: "#E8D9A0" },
        cream: "#FBF6EE",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
