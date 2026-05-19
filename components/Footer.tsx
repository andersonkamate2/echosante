'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useThemeLanguage } from './ThemeLanguageProvider';

export default function Footer() {
  const { t } = useThemeLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t theme-header mt-24 bg-white/2">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & About */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <Image
                src="/logo_echo.png"
                alt="Echo Santé Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-lg font-semibold uppercase tracking-[0.35em] text-white">
                Echo Santé
              </span>
            </Link>
            <p className="text-sm text-slate-400">
              ONG solide et durable, engagée pour la santé et l'accès aux soins.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-white">
              {t('navigation')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="transition hover:text-white">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:text-white">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/projects" className="transition hover:text-white">
                  {t('projects')}
                </Link>
              </li>
              <li>
                <Link href="/articles" className="transition hover:text-white">
                  {t('articles')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-white">
              {t('contact')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/contact" className="transition hover:text-white">
                  {t('contactPage')}
                </Link>
              </li>
              <li>
                <a href="mailto:info@example.com" className="transition hover:text-white">
                  info@example.com
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-white">
              {t('legal')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/privacy" className="transition hover:text-white">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-white">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-400">
              © {currentYear} Echo Santé. Tous droits réservés.
            </p>
            <p className="text-sm text-slate-400">
              Développé avec soin pour la santé communautaire.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
