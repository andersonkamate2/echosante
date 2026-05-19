import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
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
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-50 sm:text-6xl">
                Etre un acteur clé dans la promotion de la santé au sein de la communauté.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-100">
                Echo santé c’est l’un des programmes de la Nouvelle UNIGOM piloté par les étudiants s’inscrivant dans la logique de la troisième mission de l’université de Goma, celle de rendre service à la communauté face aux défis de santé publique de la région.
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
            <h3 className="text-2xl font-semibold text-white">Sujet de la santé</h3>
            <p className="text-slate-300">
              Sujet de la santé : description claire et inspirante du dernier projet réalisé sur le terrain, mettant en valeur l’impact et l’engagement communautaire.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-semibold text-white">Objectifs</h2>
          <p className="mt-3 text-slate-300">
            Encourager l’engagement communautaire en organisant des campagnes médiatiques et de terrain sur les enjeux de la santé publique et en incitant la communauté à l’action.
            Sensibiliser la communauté sur les enjeux de santé publique; Créer un espace d’échange et de soutien entre les parties prenantes en santé; La communication pour le changement social et comportemental au sein de nos communautés.
          </p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-white">Partenariats</h2>
          <p className="mt-3 text-slate-300">Accompagnement des acteurs publics et privés pour des programmes responsables.</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-white">Bénévolat</h2>
          <p className="mt-3 text-slate-300">Opportunités de bénévolat et de contribution à nos campagnes de santé.</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-white">Bénévolat</h2>
          <p className="mt-3 text-slate-300">Opportunités de bénévolat et de contribution à nos campagnes de santé.</p>
        </div>
      </div>
    </section>
  );
}
