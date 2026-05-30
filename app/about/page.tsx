import { getPageContentBySlug } from '@/lib/supabase/public';

export const metadata = {
  title: 'À propos - Echo Santé',
  description: 'Mission, vision et valeur de l’ONG Echo Santé.',
};

export const revalidate = 60;

export default async function AboutPage() {
  const page = await getPageContentBySlug('about');

  if (!page) {
    return (
      <section className="space-y-12 py-8 sm:py-12">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-semibold text-white sm:text-6xl">À propos</h1>
          <p className="text-slate-300">Contenu introuvable pour le moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-12 py-8 sm:py-12">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{page.title}</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">{page.title}</h1>
      </div>

      <div className="space-y-8 prose prose-invert max-w-4xl" dangerouslySetInnerHTML={{ __html: page.content }} />
    </section>
  );
}
