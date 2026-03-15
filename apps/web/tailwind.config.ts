import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config/config";

const config: Pick<Config, "presets" | "content"> = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [sharedConfig],
};

export default config;
