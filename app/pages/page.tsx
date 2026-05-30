import Link from 'next/link';
import { getPublishedPageContents } from '@/lib/supabase/public';
import type { PageContent } from '@/types/content';

export const metadata = {
  title: 'Pages publiques - Echo Santé',
  description: 'Consultez toutes les pages publiques disponibles sur Echo Santé.',
};

export const revalidate = 60;

export default async function PagesListPage() {
  const pages: PageContent[] = await getPublishedPageContents();

  return (
    <section className="space-y-10 py-8 sm:py-12">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Pages publiques</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">Toutes les pages accessibles sans connexion.</h1>
        <p className="max-w-3xl leading-8 text-slate-300">
          Découvrez les contenus institutionnels, les ressources et les informations publiques publiées par Echo Santé.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {pages.map((page) => (
          <Link key={page.id} href={`/pages/${page.slug}`} className="card transition hover:-translate-y-1 hover:border-white/20">
            <div className="space-y-3 p-6">
              <h2 className="text-2xl font-semibold text-white">{page.title}</h2>
              <p className="text-slate-300">{page.meta_description ?? page.content.substring(0, 140)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
