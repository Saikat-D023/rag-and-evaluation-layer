/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  output: "standalone",
};

export default nextConfig;
