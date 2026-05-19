import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-16 py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-300">
            ONG / Santé / Impact
          </span>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Ensemble pour une santé juste, durable et accessible à tous.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Echo Santé accompagne les communautés vulnérables avec des actions concrètes, des projets de prévention et des partenariats solides.
            </p>
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
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Nos valeurs</p>
          <div className="mt-8 space-y-6 text-slate-300">
            <p className="text-lg font-semibold text-white">Solidarité</p>
            <p>Des actions centrées sur l’humain, l’inclusion et le soutien local.</p>
            <p className="text-lg font-semibold text-white">Transparence</p>
            <p>Des résultats mesurables et un reporting clair pour chaque projet.</p>
            <p className="text-lg font-semibold text-white">Impact</p>
            <p>Des solutions conçues pour durer, avec des partenaires engagés.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="card">
          <h2 className="text-xl font-semibold text-white">Projets locaux</h2>
          <p className="mt-3 text-slate-300">Actions sur le terrain auprès des populations et des structures de santé.</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-white">Partenariats</h2>
          <p className="mt-3 text-slate-300">Accompagnement des acteurs publics et privés pour des programmes responsables.</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-white">Bénévolat</h2>
          <p className="mt-3 text-slate-300">Opportunités de bénévolat et de contribution à nos campagnes de santé.</p>
        </div>
      </div>
    </section>
  );
}
