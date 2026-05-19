'use client';

export default function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="card mx-auto max-w-2xl text-center text-slate-300">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Aucun résultat</p>
      <h2 className="mt-4 text-3xl font-semibold text-white">{title}</h2>
      <p className="mt-3 leading-7">{description}</p>
    </div>
  );
}
