import ArticleCard from '@/components/ArticleCard';
import EmptyState from '@/components/EmptyState';
import { getPublishedArticles } from '@/lib/data/public';
import type { Article } from '@/types/article';

export const metadata = {
  title: 'Articles - Echo Santé',
  description: 'Articles de l’ONG Echo Santé pour partager des retours d’expérience et des conseils santé.',
};

export const revalidate = 60;

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const articles: Article[] = await getPublishedArticles({ query: params.q, category: params.category });
  const categories = Array.from(new Set(articles.map((article: Article) => article.category)));

  if (articles.length === 0) {
    return <EmptyState title="Aucun article publié" description="Aucun article ne correspond à votre recherche pour le moment." />;
  }

  return (
    <section className="space-y-10 py-8 sm:py-12">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Articles</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">Derniers articles et actualités.</h1>
        <p className="max-w-2xl leading-8 text-slate-300">
          Retours d’expérience, conseils pratico-pratiques et témoignages de terrain sur nos actions santé.
        </p>
      </div>

      <form method="get" className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:grid-cols-[1fr_auto]">
        <input
          name="q"
          defaultValue={params.q ?? ''}
          placeholder="Rechercher un article..."
          className="rounded-3xl border border-white/10 bg-brand-950/80 px-4 py-3 text-white outline-none focus:border-white/30"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            name="category"
            defaultValue={params.category ?? ''}
            className="rounded-3xl border border-white/10 bg-brand-950/80 px-4 py-3 text-white outline-none focus:border-white/30"
          >
            <option value="">Toutes catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-slate-100">
            Rechercher
          </button>
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
