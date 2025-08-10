/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.openfoodfacts.org',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix pour undici et Firebase - Configuration complète
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      undici: false,
      'node:undici': false,
      stream: false,
      buffer: false,
      util: false,
      url: false,
      querystring: false,
    }
    
    // Force externals pour éviter les erreurs côté serveur
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('undici', 'node:undici')
    }
    
    // Ignore warnings pour les modules non résolus
    config.ignoreWarnings = [
      { module: /node_modules\/undici/ },
      { module: /node_modules\/firebase/ },
      /Critical dependency: the request of a dependency is an expression/,
    ]
    
    return config
  },
  experimental: {
    esmExternals: 'loose',
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

module.exports = nextConfig 