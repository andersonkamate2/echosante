'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/types/article';

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="card group overflow-hidden border-white/10 transition hover:-translate-y-1 hover:border-white/20">
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={article.cover_image}
          alt={article.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
      </div>
      <div className="space-y-3 p-6">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          <span>{article.category}</span>
          <span>•</span>
          <span>{new Date(article.published_at ?? article.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
        <h2 className="text-2xl font-semibold text-white">{article.title}</h2>
        <p className="text-sm leading-7 text-slate-300">{article.excerpt}</p>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-slate-400">
              {tag}
            </span>
          ))}
        </div>
        <Link href={`/articles/${article.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white">
          Lire l’article
        </Link>
      </div>
    </article>
  );
}
