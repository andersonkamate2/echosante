import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPageContentBySlug, getPublishedPageContents } from '@/lib/supabase/public';
import type { PageContent } from '@/types/content';

export const revalidate = 60;

export async function generateStaticParams() {
  const pages = await getPublishedPageContents();
  return pages.map((page: PageContent) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageContentBySlug(slug);
  if (!page) {
    return { title: 'Page introuvable' };
  }
  return {
    title: `${page.title} - Echo Santé`,
    description: page.meta_description || page.content.substring(0, 160),
  };
}

export default async function PageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageContentBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <article className="space-y-10 py-8 sm:py-12">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Page</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">{page.title}</h1>
        {page.meta_description && <p className="max-w-3xl leading-8 text-slate-300">{page.meta_description}</p>}
      </div>

      <section className="prose-invert max-w-3xl text-slate-300">
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </section>
    </article>
  );
}
