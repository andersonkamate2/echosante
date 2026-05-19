export const metadata = {
  title: 'Projets - Echo Santé',
  description: 'Découvrir les projets de l’ONG Echo Santé, axés santé, prévention et solidarité.',
};

const projects = [
  {
    title: 'Clinique mobile',
    description: 'Consultations de proximité pour les familles isolées et les villages non desservis.',
  },
  {
    title: 'Éducation sanitaire',
    description: 'Ateliers de prévention et de formation sur les gestes qui sauvent.',
  },
  {
    title: 'Partenariat local',
    description: 'Soutien aux structures de santé communautaires et renforcement de capacités.',
  },
];

export default function ProjectsPage() {
  return (
    <section className="space-y-12 py-8 sm:py-12">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Nos projets</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">Initiatives concrètes, transparence et impact durable.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project.title} className="card space-y-4">
            <h2 className="text-2xl font-semibold text-white">{project.title}</h2>
            <p className="text-slate-300">{project.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
