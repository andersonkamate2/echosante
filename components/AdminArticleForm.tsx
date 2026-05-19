'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Article } from '../types/article';
import { useThemeLanguage } from './ThemeLanguageProvider';

type ArticleFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  category: string;
  tags: string;
  status: 'draft' | 'published';
};

interface AdminArticleFormProps {
  article?: Article | null;
  onSubmit: (data: ArticleFormValues) => Promise<void>;
  isSaving?: boolean;
}

export default function AdminArticleForm({ article, onSubmit, isSaving }: AdminArticleFormProps) {
  const { t } = useThemeLanguage();
  const { register, handleSubmit, reset, watch } = useForm<ArticleFormValues>({
    defaultValues: {
      id: article?.id,
      title: article?.title ?? '',
      slug: article?.slug ?? '',
      excerpt: article?.excerpt ?? '',
      content: article?.content ?? '',
      cover_image: article?.cover_image ?? '',
      author: article?.author ?? 'Echo Santé',
      category: article?.category ?? 'Santé',
      tags: article?.tags?.join(', ') ?? '',
      status: article?.status ?? 'draft',
    },
  });

  useEffect(() => {
    reset({
      id: article?.id,
      title: article?.title ?? '',
      slug: article?.slug ?? '',
      excerpt: article?.excerpt ?? '',
      content: article?.content ?? '',
      cover_image: article?.cover_image ?? '',
      author: article?.author ?? 'Echo Santé',
      category: article?.category ?? 'Santé',
      tags: article?.tags?.join(', ') ?? '',
      status: article?.status ?? 'draft',
    });
  }, [article, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t('articleFormSubtitle')}</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{t('articleFormTitle')}</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-200">
          <span>{t('title')}</span>
          <input {...register('title', { required: true })} className="input-field" placeholder={t('titlePlaceholder')} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          <span>{t('slug')}</span>
          <input {...register('slug', { required: true })} className="input-field" placeholder={t('slugPlaceholder')} />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-200">
          <span>{t('category')}</span>
          <input {...register('category', { required: true })} className="input-field" placeholder={t('categoryPlaceholder')} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          <span>{t('status')}</span>
          <select {...register('status')} className="input-field">
            <option value="draft">{t('draft')}</option>
            <option value="published">{t('publishedStatus')}</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm text-slate-200">
        <span>{t('excerpt')}</span>
        <input
          {...register('excerpt', { required: true })}
          className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
          placeholder={t('excerptPlaceholder')}
        />
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        <span>{t('coverImage')}</span>
        <input
          {...register('cover_image', { required: true })}
          className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
          placeholder={t('coverImagePlaceholder')}
        />
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        <span>{t('content')}</span>
        <textarea
          {...register('content', { required: true })}
          rows={8}
          className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30 min-h-[180px]"
          placeholder={t('contentPlaceholder')}
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-200">
          <span>{t('author')}</span>
          <input {...register('author')} className="input-field" placeholder={t('authorPlaceholder')} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          <span>{t('tags')}</span>
          <input {...register('tags')} className="input-field" placeholder={t('tagsPlaceholder')} />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-slate-100 disabled:opacity-60"
      >
        {isSaving ? t('saving') : t('saveArticle')}
      </button>
    </form>
  );
}
