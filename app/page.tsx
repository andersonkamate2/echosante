import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, HeartPulse, ShieldCheck, UsersRound } from 'lucide-react';
import { getPageContentBySlug, getPublishedProjects } from '@/lib/data/public';
import { getServices } from '@/lib/data/services';
import { getStatistics } from '@/lib/data/statistics';
import type { Project } from '@/types/project';
import type { PageContent } from '@/types/content';

export const revalidate = 60;

export default async function HomePage() {
  const page: PageContent | null = await getPageContentBySlug('home');
  const projects: Project[] = await getPublishedProjects();
  const services = await getServices({ active: true });
  const statistics = await getStatistics({ active: true });

  return (
    <div className="space-y-12 pb-10 sm:space-y-16">
      <section className="grid gap-6 pt-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="flex min-h-[520px] flex-col justify-between rounded-xl border border-white/10 bg-brand-950 p-6 text-white sm:p-8">
          <div className="space-y-6">
            <span className="inline-flex w-fit rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
              ONG / Santé / Impact
            </span>
            <div className="space-y-4 text-white" style={{ color: '#b4b4b4c0' }}>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal !text-white sm:text-5xl" style={{ color: '#adadad' }}>
                {page?.title ?? 'Echo Santé, santé communautaire et impact local'}
              </h1>
              {page?.content ? (
                <div className="prose-content max-w-2xl text-base !text-white" style={{ color: '#97979783' }} dangerouslySetInnerHTML={{ __html: page.content }} />
              ) : (
                <p className="max-w-2xl text-base leading-7 !text-white" style={{ color: '#949494' }}>
                  Echo Santé déploie des actions de prévention, de consultation mobile et de formation pour renforcer les communautés.
                </p>
              )}
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/projects" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white-100">
              Voir les projets <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white-100">
              Contacter l’équipe
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-white/10">
            <Image src="/equip.webp" alt="Équipe Echo Santé sur le terrain" fill priority className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {statistics.slice(0, 3).map((stat) => (
              <div key={stat.id} className="surface-panel p-4">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: HeartPulse, title: 'Soins de proximité', text: 'Des interventions orientées terrain et besoins réels.' },
          { icon: ShieldCheck, title: 'Prévention', text: 'Des messages clairs pour réduire les risques évitables.' },
          { icon: UsersRound, title: 'Partenariats', text: 'Un travail coordonné avec les acteurs locaux.' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="card">
              <Icon className="text-[var(--accent)]" size={24} />
              <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
            </article>
          );
        })}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Programmes</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Actions en cours</h2>
          </div>
          <Link href="/projects" className="text-sm font-semibold text-[var(--accent)]">Tous les projets</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <article key={project.id} className="card flex min-h-44 flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-panel p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <div key={service.id} className="border-b border-white/10 pb-4 last:border-0 last:pb-0 md:border-b-0 md:border-r md:pb-0 md:pr-4 md:last:border-r-0">
              <h3 className="font-semibold text-white">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
