import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma engine + bcryptjs là native/Node-only => không bundle vào server bundle
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
