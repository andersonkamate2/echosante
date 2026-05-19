'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ThemeLanguageControls from './ThemeLanguageControls';
import { useThemeLanguage } from './ThemeLanguageProvider';

const links = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'projects', href: '/projects' },
  { key: 'articles', href: '/articles' },
  { key: 'contact', href: '/contact' },
  { key: 'adminLogin', href: '/admin/login' },
  { key: 'adminDashboard', href: '/admin/dashboard' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useThemeLanguage();

  return (
    <header className="sticky top-0 z-50 border-b theme-header backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold uppercase tracking-[0.35em] text-white">
          Echo Santé
        </Link>

        <div className="hidden items-center gap-3 sm:flex">
          <ThemeLanguageControls />
        </div>

        <button
          aria-label="Ouvrir le menu"
          className="inline-flex items-center rounded-full border border-white/10 p-2 text-white transition hover:border-white/20 sm:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav
          className={`fixed inset-x-0 top-full nav-menu pb-6 pt-4 shadow-soft transition-all duration-200 sm:static sm:top-auto sm:block sm:bg-transparent sm:p-0 ${open ? 'block' : 'hidden'}`}
        >
          <ul className="mx-auto flex max-w-7xl flex-col gap-3 px-6 text-sm sm:flex-row sm:items-center sm:gap-6 sm:px-0">
            {/* Mobile-only controls: theme + language */}
            <li className="sm:hidden">
              <div className="py-2">
                <ThemeLanguageControls />
              </div>
            </li>
            {links.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-full px-4 py-2 transition hover:bg-white/10 ${active ? 'bg-white/10 text-white' : 'text-slate-300'}`}
                    onClick={() => setOpen(false)}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
