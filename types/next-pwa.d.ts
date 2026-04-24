declare module "next-pwa" {
  import type { NextConfig } from "next"

  function withPWA(pwa: {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    [k: string]: unknown
  }): (config: NextConfig) => NextConfig

  export default withPWA
}
