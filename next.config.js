/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-require-imports */
const { withSentryConfig } = require('@sentry/nextjs');
// Require conditionnel pour éviter les erreurs en CI/CD
const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({ enabled: true })
    : (config) => config; // Fonction identité si désactivé
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // PWA activée pour la production
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /build-manifest\.json$/,
    /server-reference-manifest\.json$/,
    /react-loadable-manifest\.json$/,
  ],
  reloadOnOnline: true,
  sw: 'sw.js',
  fallbacks: {
    document: '/offline.html',
  },
  runtimeCaching: [
    // Cache pour les images Firebase Storage
    {
      urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'firebase-storage',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
        },
      },
    },
    // Cache pour les images OpenFoodFacts
    {
      urlPattern: /^https:\/\/images\.openfoodfacts\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'openfoodfacts-images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
    {
      urlPattern: /^https:\/\/static\.openfoodfacts\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'openfoodfacts-static',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
        },
      },
    },
    // Cache pour les API Firestore (lecture seule)
    {
      urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'firestore-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
        networkTimeoutSeconds: 3,
      },
    },
    // Cache pour les assets statiques
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
    // Cache pour les pages (fallback)
    {
      urlPattern: /^https?:\/\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 jour
        },
        networkTimeoutSeconds: 3,
      },
    },
  ],
});

const nextConfig = {
  // ✅ Issue #12 - ESLint activé en production pour détecter les erreurs
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  // Exclure les fichiers de test du build de production
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // 🔒 Security Headers - Audit 27.09.2025
  // Protection XSS, Clickjacking, CSRF, MIME sniffing
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  images: {
    // ✅ Issue #12 - Formats modernes pour réduire la taille (AVIF → WebP → fallback)
    formats: ['image/avif', 'image/webp'],
    // Tailles optimisées pour différents devices (mobile-first)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Cache des images optimisé (7 jours)
    minimumCacheTTL: 604800,
    // Domaines autorisés pour les images externes
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.openfoodfacts.org' },
      { protocol: 'https', hostname: 'static.openfoodfacts.org' },
      { protocol: 'https', hostname: 'world.openfoodfacts.org' },
      // Ajout d'autres CDN populaires pour flexibilité future
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'unpkg.com' },
    ],
    // Désactiver les images non optimisées en production
    unoptimized: false,
  },
  webpack: (config, { isServer }) => {
    // Exclure les fichiers de test du build de production
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      exclude: /node_modules/,
      use: 'ignore-loader',
    });

    // Exclure le dossier test du build
    config.module.rules.push({
      test: /src\/test\//,
      use: 'ignore-loader',
    });

    // Nettoyage: limiter les fallbacks au strict nécessaire
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimisations bundle - approche plus conservative
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Séparer Firebase en chunk dédié
            firebase: {
              test: /[\\/]node_modules[\\/]firebase[\\/]/,
              name: 'firebase',
              priority: 30,
              chunks: 'all',
              enforce: true,
            },
            // Séparer les gros libs d'export
            export: {
              test: /[\\/]node_modules[\\/](jspdf|exceljs|recharts)[\\/]/,
              name: 'export-libs',
              priority: 25,
              chunks: 'async', // Seulement pour les chunks async
            },
          },
        },
      };
    }

    // Supprimer warnings Prisma/OpenTelemetry spécifiques
    config.module = {
      ...config.module,
      exprContextCritical: false, // Désactive "Critical dependency" warnings
    };

    // Ignorer warnings spécifiques Sentry/Prisma
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /node_modules\/@prisma\/instrumentation/,
      /node_modules\/@opentelemetry/,
    ];

    return config;
  },
  // Next.js 15: Optimisations build time ciblées
  bundlePagesRouterDependencies: true,
  transpilePackages: ['recharts', 'date-fns'],

  // Tree shaking optimisé - packages les plus utilisés seulement
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-hot-toast',
      'date-fns',
      'clsx',
    ],
    // Optimisations webpack légères
    webpackBuildWorker: true,
    parallelServerCompiles: true,
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
};

// Export with Sentry + Bundle Analyzer + PWA
module.exports = withSentryConfig(
  withBundleAnalyzer(
    withPWA(nextConfig), // Ajouter withPWA ici
  ),
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
  },
);
