import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep visited dynamic pages in the client router cache for 30 s, so going
    // back to a tab you just saw is instant instead of a fresh server render.
    // Every write still clears it (revalidatePath in lib/actions/util.ts).
    // See node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/staleTimes.md
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
