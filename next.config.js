/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.openfoodfacts.org' },
      { protocol: 'https', hostname: 'static.openfoodfacts.org' },
      { protocol: 'https', hostname: 'world.openfoodfacts.org' },
    ],
  },
  webpack: (config, { isServer }) => {
    // Nettoyage: limiter les fallbacks au strict nécessaire
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    // Supprimer warnings Prisma/OpenTelemetry spécifiques
    config.module = {
      ...config.module,
      exprContextCritical: false, // Désactive "Critical dependency" warnings
    }
    
    // Ignorer warnings spécifiques Sentry/Prisma
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /node_modules\/@prisma\/instrumentation/,
      /node_modules\/@opentelemetry/
    ]
    
    return config
  },
  // Next.js 15: Nouvelles optimisations
  bundlePagesRouterDependencies: true,
  transpilePackages: ['recharts'],
  
  // Tree shaking optimisé
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react', '@heroicons/react'],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }
}

// Export with Sentry + Bundle Analyzer
module.exports = withSentryConfig(
  withBundleAnalyzer(nextConfig),
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    
    // Upload source maps during build
    widenClientFileUpload: true,
    
    // Hides source maps from generated client bundles
    hideSourceMaps: true,
    
    // Automatically tree-shake Sentry logger statements
    disableLogger: true,
    
    // Enables automatic instrumentation of Vercel Cron Monitors.
    automaticVercelMonitors: true,
    uploadClientErrors: true,
  }
)