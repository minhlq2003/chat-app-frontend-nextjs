import type { Config } from "tailwindcss";
const {nextui} = require("@nextui-org/react");
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        custompurple : "#5457FF",
        customyellow: "#FFEA00"
      },
    },
  },
  plugins: [nextui()],
} satisfies Config;
