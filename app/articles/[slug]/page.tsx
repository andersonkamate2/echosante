import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleBySlug, getPublishedArticles } from '@/lib/supabase/articles';
import type { Article } from '@/types/article';

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((article: Article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return { title: 'Article introuvable' };
  }
  return {
    title: `${article.title} - Echo Santé`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="space-y-10 py-8 sm:py-12">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Article</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">{article.title}</h1>
        <p className="max-w-3xl leading-8 text-slate-300">{article.excerpt}</p>
      </div>

      <img className="rounded-[2rem] border border-white/10 object-cover shadow-soft" src={article.cover_image} alt={article.title} />

      <section className="grid gap-8 lg:grid-cols-[0.75fr_0.25fr]">
        <div className="space-y-6 text-slate-300">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
        <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Auteur</p>
            <p className="mt-2 text-white">{article.author}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Catégorie</p>
            <p className="mt-2 text-white">{article.category}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Publié le</p>
            <p className="mt-2 text-white">{new Date(article.published_at ?? article.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Tags</p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </article>
  );
}
