import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import ChunkGuard from '@/components/runtime/ChunkGuard'
import InstallBanner from '@/components/pwa/InstallBanner'
import VitalsReporterWrapper from '@/components/analytics/VitalsReporterWrapper'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SuperNovaFit - Plateforme Diète & Entraînement',
  description: 'Suivez votre diète, vos entraînements et votre progression physique',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/icons/icon-192x192.svg' },
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SuperNovaFit',
  },
  openGraph: {
    title: 'SuperNovaFit',
    description: 'Suivez votre diète, vos entraînements et votre progression physique',
    siteName: 'SuperNovaFit',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://images.openfoodfacts.org" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                  }).then(function(registration) {
                    console.log('Service Worker registered successfully:', registration);
                  }).catch(function(error) {
                    console.log('Service Worker registration failed:', error);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gradient-space min-h-screen`}>
        {/* Skip Links for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-white px-4 py-2 rounded-md shadow-lg transition-all"
        >
          Aller au contenu principal
        </a>
        <a 
          href="#main-nav" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-52 focus:z-50 bg-primary text-white px-4 py-2 rounded-md shadow-lg transition-all"
        >
          Aller à la navigation
        </a>
        {/* <SentryProvider /> - Désactivé: remplacé par sentry.client.config.ts */}
        <VitalsReporterWrapper />
        <ChunkGuard />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(20px)',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
              },
            },
          }}
        />
        
        {/* PWA Install Banner */}
        <InstallBanner />
      </body>
    </html>
  )
} 