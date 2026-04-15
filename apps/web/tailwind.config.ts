import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config/config";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [sharedConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        space: ["var(--font-space)", "sans-serif"],
      },
    },
  },
};

export default config;
