'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

type TabType = 'articles' | 'projects' | 'team' | 'services' | 'statistics' | 'pages' | 'gallery' | 'site-settings' | 'messages';

type AdminResourceFormProps = {
  tab: TabType;
  resource?: any | null;
  onSubmit: (data: any) => Promise<void>;
  isSaving?: boolean;
};

const defaultValuesForTab = (tab: TabType, resource?: any) => {
  const safeResource = resource && typeof resource === 'object' ? resource : {};

  switch (tab) {
    case 'projects':
      return {
        id: safeResource.id ?? '',
        title: safeResource.title ?? '',
        slug: safeResource.slug ?? '',
        description: safeResource.description ?? '',
        image_url: safeResource.image_url ?? '',
        status: safeResource.status ?? 'draft',
        order: safeResource.order ?? 0,
      };
    case 'team':
      return {
        id: safeResource.id ?? '',
        name: safeResource.name ?? '',
        role: safeResource.role ?? '',
        email: safeResource.email ?? '',
        phone: safeResource.phone ?? '',
        image_url: safeResource.image_url ?? '',
        bio: safeResource.bio ?? '',
        order: safeResource.order ?? 0,
        active: safeResource.active ?? true,
      };
    case 'services':
      return {
        id: safeResource.id ?? '',
        title: safeResource.title ?? '',
        description: safeResource.description ?? '',
        icon: safeResource.icon ?? '',
        order: safeResource.order ?? 0,
        active: safeResource.active ?? true,
      };
    case 'statistics':
      return {
        id: safeResource.id ?? '',
        label: safeResource.label ?? '',
        value: safeResource.value ?? '',
        order: safeResource.order ?? 0,
        active: safeResource.active ?? true,
      };
    case 'pages':
      return {
        id: safeResource.id ?? '',
        slug: safeResource.slug ?? '',
        title: safeResource.title ?? '',
        meta_description: safeResource.meta_description ?? '',
        content: safeResource.content ?? '',
        order: safeResource.order ?? 0,
        published: safeResource.published ?? true,
      };
    case 'gallery':
      return {
        id: safeResource.id ?? '',
        title: safeResource.title ?? '',
        image_url: safeResource.image_url ?? '',
        description: safeResource.description ?? '',
        category: safeResource.category ?? '',
        order: safeResource.order ?? 0,
        active: safeResource.active ?? true,
      };
    case 'site-settings':
      return {
        id: safeResource.id ?? '',
        key: safeResource.key ?? '',
        value: safeResource.value ?? '',
        description: safeResource.description ?? '',
      };
    default:
      return { id: safeResource.id ?? '' };
  }
};

const titleForTab = (tab: TabType) => {
  switch (tab) {
    case 'projects':
      return 'Projet';
    case 'team':
      return 'Membre d’équipe';
    case 'services':
      return 'Service';
    case 'statistics':
      return 'Statistique';
    case 'pages':
      return 'Page';
    case 'gallery':
      return 'Élément de galerie';
    case 'site-settings':
      return 'Paramètre';
    default:
      return 'Ressource';
  }
};

const submitTextForTab = (tab: TabType, hasId: boolean) => {
  const action = hasId ? 'Mettre à jour' : 'Créer';
  return `${action} ${titleForTab(tab)}`;
};

export default function AdminResourceForm({ tab, resource, onSubmit, isSaving }: AdminResourceFormProps) {
  const safeResource = useMemo(() => (resource && typeof resource === 'object' ? resource : {}), [resource]);
  const { register, handleSubmit, reset, watch } = useForm<any>({ defaultValues: defaultValuesForTab(tab, safeResource) });

  useEffect(() => {
    reset(defaultValuesForTab(tab, safeResource));
  }, [tab, safeResource, reset]);

  const values = watch();
  const hasId = Boolean(values?.id);

  const renderFields = () => {
    switch (tab) {
      case 'projects':
        return (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Titre</span>
                <input {...register('title', { required: true })} className="input-field" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Slug</span>
                <input {...register('slug', { required: true })} className="input-field" />
              </label>
            </div>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Description</span>
              <textarea {...register('description', { required: true })} rows={4} className="input-field" />
            </label>
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Image URL</span>
                <input {...register('image_url')} className="input-field" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Statut</span>
                <input {...register('status')} className="input-field" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Ordre</span>
                <input type="number" {...register('order', { valueAsNumber: true })} className="input-field" />
              </label>
            </div>
          </>
        );
      case 'team':
        return (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Nom</span>
                <input {...register('name', { required: true })} className="input-field" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Rôle</span>
                <input {...register('role', { required: true })} className="input-field" />
              </label>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Email</span>
                <input type="email" {...register('email')} className="input-field" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Téléphone</span>
                <input {...register('phone')} className="input-field" />
              </label>
            </div>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Description</span>
              <textarea {...register('bio')} rows={4} className="input-field" />
            </label>
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Image URL</span>
                <input {...register('image_url')} className="input-field" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Actif</span>
                <input type="checkbox" {...register('active')} className="h-5 w-5" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Ordre</span>
                <input type="number" {...register('order', { valueAsNumber: true })} className="input-field" />
              </label>
            </div>
          </>
        );
      case 'services':
        return (
          <>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Titre</span>
              <input {...register('title', { required: true })} className="input-field" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Description</span>
              <textarea {...register('description', { required: true })} rows={4} className="input-field" />
            </label>
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Icône</span>
                <input {...register('icon')} className="input-field" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Actif</span>
                <input type="checkbox" {...register('active')} className="h-5 w-5" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Ordre</span>
                <input type="number" {...register('order', { valueAsNumber: true })} className="input-field" />
              </label>
            </div>
          </>
        );
      case 'statistics':
        return (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Label</span>
                <input {...register('label', { required: true })} className="input-field" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Valeur</span>
                <input {...register('value', { required: true })} className="input-field" />
              </label>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 items-end">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Actif</span>
                <input type="checkbox" {...register('active')} className="h-5 w-5" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Ordre</span>
                <input type="number" {...register('order', { valueAsNumber: true })} className="input-field" />
              </label>
            </div>
          </>
        );
      case 'pages':
        return (
          <>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Slug</span>
              <input {...register('slug', { required: true })} className="input-field" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Titre</span>
              <input {...register('title', { required: true })} className="input-field" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Méta description</span>
              <input {...register('meta_description')} className="input-field" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Contenu</span>
              <textarea {...register('content', { required: true })} rows={6} className="input-field" />
            </label>
            <div className="grid gap-4 lg:grid-cols-2 items-end">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Publié</span>
                <input type="checkbox" {...register('published')} className="h-5 w-5" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Ordre</span>
                <input type="number" {...register('order', { valueAsNumber: true })} className="input-field" />
              </label>
            </div>
          </>
        );
      case 'gallery':
        return (
          <>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Titre</span>
              <input {...register('title', { required: true })} className="input-field" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Image URL</span>
              <input {...register('image_url', { required: true })} className="input-field" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Description</span>
              <textarea {...register('description')} rows={4} className="input-field" />
            </label>
            <div className="grid gap-4 lg:grid-cols-3 items-end">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Catégorie</span>
                <input {...register('category')} className="input-field" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Actif</span>
                <input type="checkbox" {...register('active')} className="h-5 w-5" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Ordre</span>
                <input type="number" {...register('order', { valueAsNumber: true })} className="input-field" />
              </label>
            </div>
          </>
        );
      case 'site-settings':
        return (
          <>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Clé</span>
              <input {...register('key', { required: true })} className="input-field" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Valeur</span>
              <input {...register('value', { required: true })} className="input-field" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">
              <span>Description</span>
              <textarea {...register('description')} rows={4} className="input-field" />
            </label>
          </>
        );
      default:
        return <p className="text-sm text-slate-400">Sélectionnez un onglet avec un formulaire.</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Administration</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{hasId ? `Modifier ${titleForTab(tab)}` : `Créer ${titleForTab(tab)}`}</h2>
      </div>

      {renderFields()}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-slate-100 disabled:opacity-60"
      >
        {isSaving ? 'Enregistrement...' : submitTextForTab(tab, hasId)}
      </button>
    </form>
  );
}
