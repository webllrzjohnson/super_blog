import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/rss.xml', destination: '/feed' }]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  ...(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
    ? {
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        widenClientFileUpload: true,
      }
    : {}),
})
