export const metadata = {
  title: 'À propos - Echo Santé',
  description: 'Mission, vision et valeur de l’ONG Echo Santé.',
};

export default function AboutPage() {
  return (
    <section className="space-y-12 py-8 sm:py-12">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Notre mission</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">Un engagement sérieux pour la santé et le bien-être des communautés.</h1>
        <p className="text-lg leading-8 text-slate-300">
          Echo Santé est une ONG dédiée à l’amélioration de l’accès aux soins, à la prévention et à la formation des acteurs de santé. Nous construisons des projets durables, transparents et alignés sur les besoins locaux.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-2xl font-semibold text-white">Vision</h2>
          <p className="mt-4 text-slate-300">Une société où chaque personne peut accéder à des services de santé de qualité, sans discrimination et avec dignité.</p>
        </div>
        <div className="card">
          <h2 className="text-2xl font-semibold text-white">Valeurs</h2>
          <ul className="mt-4 space-y-3 text-slate-300">
            <li>Intégrité, proximité, responsabilité.</li>
            <li>Innovation adaptée au terrain.</li>
            <li>Partage de connaissances et renforcement durable.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
