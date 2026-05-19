import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="card max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Page introuvable</p>
        <h1 className="mt-6 text-5xl font-semibold text-white">404</h1>
        <p className="mt-4 text-slate-300">La page que vous cherchez n’existe pas ou a été déplacée.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-slate-100">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
