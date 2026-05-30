import Link from 'next/link';
import Image from 'next/image';
import { getPageContentBySlug, getPublishedProjects } from '@/lib/supabase/public';
import type { Project } from '@/types/project';
import type { PageContent } from '@/types/content';

export const revalidate = 60;

export default async function HomePage() {
  const page: PageContent | null = await getPageContentBySlug('home');
  const projects: Project[] = await getPublishedProjects();

  return (
    <section className="space-y-16 py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div
          className="relative overflow-hidden rounded-[2rem] bg-cover bg-center bg-no-repeat p-8 sm:p-10 shadow-[inset_0_0_60px_rgba(0,0,0,0.7)]"
          style={{ backgroundImage: "url('/equip.webp')" }}
        >
          <div className="absolute inset-0 bg-slate-950/80" />
          <div className="relative space-y-8 text-shadow-lg">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-100 backdrop-blur-sm">
              ONG / Santé / Impact
            </span>
            <div className="space-y-5">
              <h4 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-50 sm:text-6lg">
                {page?.title ?? 'Etre un acteur clé dans la promotion de la santé au sein de la communauté.'}
              </h4>
              {page?.content ? (
                <div
                  className="max-w-2xl text-lg leading-8 text-slate-100"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              ) : (
                <p className="max-w-2xl text-lg leading-8 text-slate-100">
                  Echo santé c’est l’un des programmes de la Nouvelle UNIGOM piloté par les étudiants s’inscrivant dans la logique de la troisième mission de l’université de Goma, celle de rendre service à la communauté face aux défis de santé publique de la région.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/about" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-slate-100">
                En savoir plus
              </Link>
              <Link href="/contact" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5">
                Contact WhatsApp
              </Link>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-0 shadow-soft overflow-hidden">
          <div className="relative h-56 w-full sm:h-64">
            <Image
              src="/img5.webp"
              alt="Dernier projet santé"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-4 p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Dernier projet réalisé</p>
            <h3 className="text-2xl font-semibold text-white">{projects[0]?.title ?? 'Sujet de la santé'}</h3>
            <p className="text-slate-300">
              {projects[0]?.description ?? 'Sujet de la santé : description claire et inspirante du dernier projet réalisé sur le terrain, mettant en valeur l’impact et l’engagement communautaire.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {projects.slice(0, 4).map((project) => (
          <div key={project.id} className="card">
            <h2 className="text-xl font-semibold text-white">{project.title}</h2>
            <p className="mt-3 text-slate-300">{project.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
