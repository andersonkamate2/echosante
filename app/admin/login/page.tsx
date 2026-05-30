
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInAdmin } from '@/lib/auth';
import { useThemeLanguage } from '@/components/ThemeLanguageProvider';

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useThemeLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: authError } = await signInAdmin(email, password);
    setIsLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push('/admin/dashboard');
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-lg space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-soft">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('admin')}</p>
          <h1 className="text-4xl font-semibold text-white">{t('loginTitle')}</h1>
          <p className="text-slate-300">{t('loginDescription')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="grid gap-2 text-sm text-slate-200">
            <span>{t('email')}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
              placeholder={t('emailPlaceholder')}
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>{t('password')}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
              placeholder={t('passwordPlaceholder')}
            />
          </label>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-slate-100 disabled:opacity-60"
          >
            {isLoading ? t('connecting') : t('signIn')}
          </button>
        </form>
      </div>
    </section>
  );
}
