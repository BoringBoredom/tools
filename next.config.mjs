/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/tools",
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
};

export default nextConfig;
