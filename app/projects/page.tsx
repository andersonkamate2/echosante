import type { Project } from '@/types/project';
import { getPublishedProjects } from '@/lib/supabase/public';

export const metadata = {
  title: 'Projets - Echo Santé',
  description: 'Découvrir les projets de l’ONG Echo Santé, axés santé, prévention et solidarité.',
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects: Project[] = await getPublishedProjects();

  return (
    <section className="space-y-12 py-8 sm:py-12">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Nos projets</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">Initiatives concrètes, transparence et impact durable.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="card col-span-full text-slate-300">Aucun projet actif n’est disponible pour le moment.</div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="card space-y-4">
              <h2 className="text-2xl font-semibold text-white">{project.title}</h2>
              <p className="text-slate-300">{project.description}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
