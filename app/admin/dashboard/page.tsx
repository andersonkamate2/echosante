'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  File,
  Filter,
  Image,
  Loader2,
  LogOut,
  Mail,
  Newspaper,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { getAdminSession, signOutAdmin } from '@/lib/auth';
import type { Article } from '@/types/article';
import AdminArticleForm from '@/components/AdminArticleForm';
import AdminResourceForm from '@/components/AdminResourceForm';
import { useThemeLanguage } from '@/components/ThemeLanguageProvider';

type TabType = 'articles' | 'projects' | 'team' | 'services' | 'statistics' | 'pages' | 'gallery' | 'site-settings' | 'messages';

type TabItem = {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  endpoint: string;
};

const tabs: TabItem[] = [
  { id: 'articles', label: 'Articles', icon: Newspaper, endpoint: 'articles' },
  { id: 'projects', label: 'Projets', icon: Briefcase, endpoint: 'projects' },
  { id: 'team', label: 'Équipe', icon: Users, endpoint: 'team' },
  { id: 'services', label: 'Services', icon: Zap, endpoint: 'services' },
  { id: 'statistics', label: 'Stats', icon: BarChart3, endpoint: 'statistics' },
  { id: 'pages', label: 'Pages', icon: File, endpoint: 'pages' },
  { id: 'gallery', label: 'Galerie', icon: Image, endpoint: 'gallery' },
  { id: 'site-settings', label: 'Paramètres', icon: Filter, endpoint: 'site-settings' },
  { id: 'messages', label: 'Messages', icon: Mail, endpoint: 'contact' },
];

const pageSize = 6;

function searchableText(item: any) {
  return [item.title, item.name, item.label, item.key, item.value, item.role, item.subject, item.email, item.description, item.message, item.slug, item.category, item.status]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function itemTitle(item: any, tab: TabType) {
  if (tab === 'statistics') return `${item.value} - ${item.label}`;
  return item.title || item.name || item.key || item.subject || item.label || 'Élément sans titre';
}

function itemSubtitle(item: any, tab: TabType) {
  if (tab === 'articles') return `${item.status || 'draft'} · ${item.category || 'Sans catégorie'}`;
  if (tab === 'projects') return item.description;
  if (tab === 'team') return item.role;
  if (tab === 'services') return item.description;
  if (tab === 'statistics') return item.active ? 'Actif' : 'Masqué';
  if (tab === 'pages') return `/${item.slug} · ${item.published ? 'publiée' : 'brouillon'}`;
  if (tab === 'gallery') return item.category || 'Sans catégorie';
  if (tab === 'site-settings') return item.value;
  return `${item.name || item.email} · ${item.read ? 'lu' : 'nouveau'}`;
}

export default function AdminDashboardPage() {
  const { t } = useThemeLanguage();
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('articles');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<any | null>(null);
  const [collections, setCollections] = useState<Record<TabType, any[]>>({
    articles: [],
    projects: [],
    team: [],
    services: [],
    statistics: [],
    pages: [],
    gallery: [],
    'site-settings': [],
    messages: [],
  });

  const activeMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const activeItems = collections[activeTab];

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return activeItems.filter((item) => {
      const matchesQuery = !normalized || searchableText(item).includes(normalized);
      const statusValue = activeTab === 'messages' ? (item.read ? 'read' : 'unread') : String(item.status ?? item.active ?? item.published ?? 'all');
      const matchesStatus = statusFilter === 'all' || statusValue === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [activeItems, activeTab, query, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const fetchAll = async () => {
    setError(null);
    const requests = await Promise.all(
      tabs.map(async (tab) => {
        const response = await fetch(`/api/${tab.endpoint}`, { credentials: 'same-origin', cache: 'no-store' });
        if (!response.ok) throw new Error(`Chargement impossible: ${tab.label}`);
        return [tab.id, await response.json()] as const;
      }),
    );
    setCollections(Object.fromEntries(requests) as Record<TabType, any[]>);
  };

  useEffect(() => {
    const loadSession = async () => {
      const { data, error: sessionError } = await getAdminSession();
      if (sessionError || !data.session) {
        setAccessError(t('mustBeLoggedIn'));
        setSessionChecked(true);
        setIsLoading(false);
        return;
      }

      try {
        await fetchAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setSessionChecked(true);
        setIsLoading(false);
      }
    };

    loadSession();
  }, [t]);

  useEffect(() => {
    setSelectedItem(null);
    setQuery('');
    setStatusFilter('all');
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const handleLogout = async () => {
    await signOutAdmin();
    router.push('/admin/login');
  };

  const handleSubmit = async (values: any) => {
    setIsSaving(true);
    setError(null);

    const payload: any = { ...values };
    let url = `/api/${activeMeta.endpoint}`;
    let method = 'POST';

    if (activeTab === 'articles') {
      payload.tags = String(values.tags ?? '').split(',').map((tag: string) => tag.trim()).filter(Boolean);
      payload.published_at = values.status === 'published' ? new Date().toISOString() : null;
    }

    if (values.id && activeTab !== 'articles') {
      url = `/api/${activeMeta.endpoint}/${values.id}`;
      method = 'PUT';
    }

    if (activeTab === 'pages') payload.published = Boolean(values.published);
    if (['team', 'services', 'statistics', 'gallery'].includes(activeTab)) payload.active = Boolean(values.active);
    if ('order' in payload) payload.order = Number(payload.order || 0);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Erreur lors de l’enregistrement');
      await fetchAll();
      setSelectedItem(null);
      setNotice('Enregistrement effectué');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setError(null);
    try {
      const response = await fetch(`/api/${activeMeta.endpoint}/${pendingDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Suppression impossible');
      await fetchAll();
      setPendingDelete(null);
      setNotice('Élément supprimé');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  const markMessageRead = async (id: string) => {
    const response = await fetch(`/api/contact/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAsRead: true }),
    });
    if (response.ok) {
      await fetchAll();
      setNotice('Message marqué comme lu');
    }
  };

  if (sessionChecked && accessError) {
    return (
      <section className="min-h-[70vh] py-10">
        <div className="card mx-auto max-w-xl space-y-5 text-center">
          <AlertTriangle className="mx-auto text-red-500" size={36} />
          <h1 className="text-2xl font-semibold text-white">{t('accessDenied')}</h1>
          <p className="text-slate-300">{accessError}</p>
          <button onClick={() => router.push('/admin/login')} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">
            {t('goToLogin')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 py-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Panneau de contrôle</h1>
          <p className="mt-2 text-sm text-slate-300">Contenu JSON local, CRUD complet et publication instantanée.</p>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
          <LogOut size={16} /> {t('logout')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 sm:flex sm:overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition sm:whitespace-nowrap ${
                active ? 'bg-[var(--accent)] text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} />{notice}</span>
          <button onClick={() => setNotice(null)} aria-label="Fermer"><X size={16} /></button>
        </div>
      )}
      {error && <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>}

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300">
          <Loader2 className="mr-2 animate-spin" size={18} /> Chargement des données...
        </div>
      ) : activeTab === 'messages' ? (
        <div className="space-y-4">
          <Toolbar query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} activeTab={activeTab} />
          <ResourceList
            tab={activeTab}
            items={paginatedItems}
            onEdit={() => undefined}
            onDelete={setPendingDelete}
            onMarkRead={markMessageRead}
          />
          <Pagination page={page} pageCount={pageCount} setPage={setPage} total={filteredItems.length} />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            {activeTab === 'articles' ? (
              <AdminArticleForm article={selectedItem as Article | null} onSubmit={handleSubmit} isSaving={isSaving} />
            ) : (
              <AdminResourceForm tab={activeTab} resource={selectedItem} onSubmit={handleSubmit} isSaving={isSaving} />
            )}
          </div>

          <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 xl:sticky xl:top-28 xl:h-fit">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{activeMeta.label}</h2>
                <p className="text-sm text-slate-400">{filteredItems.length} élément(s)</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-white" aria-label="Créer">
                <Plus size={18} />
              </button>
            </div>
            <Toolbar query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} activeTab={activeTab} />
            <ResourceList tab={activeTab} items={paginatedItems} onEdit={setSelectedItem} onDelete={setPendingDelete} />
            <Pagination page={page} pageCount={pageCount} setPage={setPage} total={filteredItems.length} />
          </aside>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--surface)] p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-500/10 p-2 text-red-400"><Trash2 size={18} /></div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Confirmer la suppression</h3>
                <p className="text-sm text-slate-300">Cette action supprimera définitivement “{itemTitle(pendingDelete, activeTab)}” du fichier JSON.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setPendingDelete(null)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10">Annuler</button>
              <button onClick={confirmDelete} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Toolbar({ query, setQuery, statusFilter, setStatusFilter, activeTab }: {
  query: string;
  setQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  activeTab: TabType;
}) {
  const options = activeTab === 'articles'
    ? [ ['all', 'Tous'], ['published', 'Publiés'], ['draft', 'Brouillons'] ]
    : activeTab === 'messages'
      ? [ ['all', 'Tous'], ['unread', 'Non lus'], ['read', 'Lus'] ]
      : [ ['all', 'Tous'], ['true', 'Actifs/publiés'], ['false', 'Masqués'] ];

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" className="input-field w-full pl-10" />
      </label>
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-field min-w-36">
        {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
  );
}

function ResourceList({ tab, items, onEdit, onDelete, onMarkRead }: {
  tab: TabType;
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onMarkRead?: (id: string) => void;
}) {
  if (items.length === 0) {
    return <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">Aucun élément trouvé.</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className={`rounded-2xl border p-4 ${tab === 'messages' && !item.read ? 'border-[var(--accent)] bg-red-500/10' : 'border-white/10 bg-white/5'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-white">{itemTitle(item, tab)}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{itemSubtitle(item, tab)}</p>
              {tab === 'messages' && <p className="mt-2 line-clamp-3 text-sm text-slate-300">{item.message}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {tab !== 'messages' && (
                <button onClick={() => onEdit(item)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10" aria-label="Modifier">
                  <Edit3 size={15} />
                </button>
              )}
              {tab === 'messages' && !item.read && onMarkRead && (
                <button onClick={() => onMarkRead(item.id)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white hover:bg-white/10">Lu</button>
              )}
              <button onClick={() => onDelete(item)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10" aria-label="Supprimer">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Pagination({ page, pageCount, setPage, total }: {
  page: number;
  pageCount: number;
  total: number;
  setPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
      <span>{total} résultat(s)</span>
      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 disabled:opacity-40" aria-label="Page précédente">
          <ChevronLeft size={16} />
        </button>
        <span>{page}/{pageCount}</span>
        <button disabled={page >= pageCount} onClick={() => setPage(page + 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 disabled:opacity-40" aria-label="Page suivante">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
