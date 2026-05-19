'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit3, LogOut } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';
import { getAdminSession, signOutAdmin } from '@/lib/supabase/auth';
import type { Article } from '@/types/article';
import AdminArticleForm from '@/components/AdminArticleForm';
import { useThemeLanguage } from '@/components/ThemeLanguageProvider';

export default function AdminDashboardPage() {
  const { t } = useThemeLanguage();
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = async () => {
    const { data, error } = await supabaseClient
      .from<Article>('articles')
      .select('id, title, slug, excerpt, author, category, status, published_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setSessionError(error.message);
      return;
    }
    setArticles(data ?? []);
  };

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await getAdminSession();
      if (error || !data.session) {
        setSessionError(t('mustBeLoggedIn'));
        setSessionChecked(true);
        return;
      }
      setSessionChecked(true);
      await fetchArticles();
      setIsLoading(false);
    };

    loadSession();
  }, [t]);

  const handleLogout = async () => {
    await signOutAdmin();
    router.push('/admin/login');
  };

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmer la suppression de cet article ?')) {
      return;
    }
    const { error } = await supabaseClient.from('articles').delete().eq('id', id);
    if (error) {
      setSessionError(error.message);
      return;
    }
    setArticles((current) => current.filter((article) => article.id !== id));
  };

  const handleSubmit = async (values: any) => {
    setIsSaving(true);
    const payload = {
      ...values,
      tags: values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      published_at: values.status === 'published' ? new Date().toISOString() : null,
    };
    const { data, error } = await supabaseClient.from<Article>('articles').upsert(payload, { onConflict: 'id' });
    setIsSaving(false);
    if (error) {
      setSessionError(error.message);
      return;
    }
    await fetchArticles();
    setSelectedArticle(null);
  };

  const publishCount = useMemo(() => articles.filter((article) => article.status === 'published').length, [articles]);

  if (sessionChecked && sessionError) {
    return (
      <section className="min-h-[70vh] py-12">
        <div className="card mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-semibold text-white">{t('accessDenied')}</h1>
          <p className="text-slate-300">{sessionError}</p>
          <button onClick={() => router.push('/admin/login')} className="rounded-full bg-white px-6 py-3 text-black">
            {t('goToLogin')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10 py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('admin')}</p>
          <h1 className="text-4xl font-semibold text-white">{t('adminDashboard')}</h1>
          <p className="mt-2 text-slate-300">{t('dashboardDescription')}</p>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10">
          <LogOut size={16} /> {t('logout')}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_0.75fr]">
        <div className="space-y-6">
          <AdminArticleForm article={selectedArticle} onSubmit={handleSubmit} isSaving={isSaving} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('articles')}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{articles.length}</p>
            </div>
            <div className="card">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{t('published')}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{publishCount}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-soft">
          <h2 className="text-2xl font-semibold text-white">{t('articleList')}</h2>
          {isLoading ? (
            <p className="text-slate-300">{t('loading')}</p>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="rounded-3xl border border-white/10 bg-brand-950/80 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-white">{article.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{article.category} • {article.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(article)} className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/5">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(article.id)} className="rounded-full border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {sessionError ? <p className="text-sm text-red-400">{sessionError}</p> : null}
    </section>
  );
}
