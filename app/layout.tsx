import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeLanguageProvider } from '@/components/ThemeLanguageProvider';
import PWARegister from '@/components/PWARegister';

const SITE_URL = process.env.SITE_URL && process.env.SITE_URL.trim() ? process.env.SITE_URL.trim() : 'https://echosante.org';

export const metadata: Metadata = {
  title: {
    default: 'Echo Santé',
    template: '%s | Echo Santé',
  },
  description: "ONG dédiée à la santé communautaire, à la prévention et à l'accès aux soins.",
  metadataBase: new URL(SITE_URL),
  applicationName: 'Echo Santé',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Echo Santé',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: '/logo_echo.png',
    apple: '/logo_echo.png',
  },
  openGraph: {
    title: 'Echo Santé',
    description: "Santé communautaire, prévention et impact local.",
    type: 'website',
    url: SITE_URL,
    siteName: 'Echo Santé',
    images: ['/equip.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echo Santé',
    description: "Santé communautaire, prévention et impact local.",
    images: ['/equip.webp'],
  },
};

export const viewport: Viewport = {
  themeColor: '#dc2626',
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="light">
      <body className="theme-shell">
        <ThemeLanguageProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 pb-24 pt-8 sm:px-8">
            {children}
          </main>
          <Footer />
          <PWARegister />
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}
