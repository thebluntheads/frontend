const checkEnvVariables = require("./check-env-variables")
const createNextIntlPlugin = require("next-intl/plugin")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "onconnects-media.s3.us-east-1.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "thebluntheads.s3.us-east-2.amazonaws.com",
        pathname: "**",
      },
    ],
  },
  async rewrites() {
    return {
      // Apple Pay / Clover domain verification fetches this path with NO file
      // extension and expects to *read* it (text/plain) — not download it.
      // Serving the extensionless static file gives `application/octet-stream`,
      // which browsers download. Rewrite to the `.txt` twin so it's served
      // inline as text/plain. `beforeFiles` so this resolves before the static
      // handler would serve the extensionless copy as octet-stream.
      beforeFiles: [
        {
          source: "/.well-known/apple-developer-merchantid-domain-association",
          destination:
            "/.well-known/apple-developer-merchantid-domain-association.txt",
        },
      ],
    }
  },
}
const withNextIntl = createNextIntlPlugin()

module.exports = withNextIntl(nextConfig)
