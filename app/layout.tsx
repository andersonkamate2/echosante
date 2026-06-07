import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeLanguageProvider } from '@/components/ThemeLanguageProvider';

const SITE_URL = process.env.SITE_URL && process.env.SITE_URL.trim() ? process.env.SITE_URL.trim() : 'https://echosante.org';

export const metadata: Metadata = {
  title: 'Echo Santé - ONG moderne',
  description: "Site web professionnel pour l'ONG Echo Santé, responsive, minimaliste et optimisé SEO.",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/logo_echo.png',
  },
  openGraph: {
    title: 'Echo Santé',
    description: "ONG solide et durable, engagée pour la santé et l'accès aux soins.",
    type: 'website',
    url: SITE_URL,
  },
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
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}
