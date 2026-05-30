import { getPublishedGallery } from '@/lib/supabase/public';
import type { GalleryItem } from '@/types/content';

export const metadata = {
  title: 'Galerie - Echo Santé',
  description: "Galerie de photos des initiatives et événements d'Echo Santé.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const galleryItems: GalleryItem[] = await getPublishedGallery();
  const categories = Array.from(new Set(galleryItems.map((item) => item.category))).sort();

  return (
    <section className="space-y-10 py-8 sm:py-12">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Galerie</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">Nos initiatives en images.</h1>
        <p className="max-w-3xl leading-8 text-slate-300">
          Découvrez les photos de nos événements, campagnes de sensibilisation et actions sur le terrain.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item) => (
          <figure key={item.id} className="group overflow-hidden rounded-[2rem] border border-white/10 transition hover:border-white/20">
            <img
              src={item.image_url}
              alt={item.title}
              className="h-64 w-full object-cover transition duration-300 group-hover:scale-110"
            />
            {item.title && (
              <figcaption className="bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">{item.title}</p>
                {item.description && <p className="mt-1 text-xs text-slate-400">{item.description}</p>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
