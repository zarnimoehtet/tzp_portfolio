import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Dev only: lets phones/other devices on the LAN use hot reload.
  allowedDevOrigins: ["192.168.100.157"],
  // Server Action arguments include passwords and form data; keep them out of dev logs.
  logging: { serverFunctions: false },
  // Photos are optimized once at upload time (sharp → R2), so the runtime
  // image optimizer is not used for gallery images.
  serverExternalPackages: ["sharp"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
