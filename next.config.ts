import type { NextConfig } from "next"
import withPWA from "next-pwa"

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})

const nextConfig: NextConfig = {
  // next-pwa injecte une config webpack : Next 16 lance Turbopack par défaut en dev;
  // une entrée vide indique que ce mélange est voulu (voir doc turbopack).
  turbopack: {},
}

export default withPWAConfig(nextConfig)
