import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repoName = "WT-BR-Analyst";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined 
  ? process.env.NEXT_PUBLIC_BASE_PATH 
  : (isProd ? `/${repoName}` : "");

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};

export default nextConfig;
