'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit3, LogOut, Newspaper, Briefcase, Users, Zap, BarChart3, File, Image, Mail } from 'lucide-react';
import { getAdminSession, signOutAdmin } from '@/lib/auth';
import type { Article } from '@/types/article';
import AdminArticleForm from '@/components/AdminArticleForm';
import AdminResourceForm from '@/components/AdminResourceForm';
import { useThemeLanguage } from '@/components/ThemeLanguageProvider';

type TabType = 'articles' | 'projects' | 'team' | 'services' | 'statistics' | 'pages' | 'gallery' | 'site-settings' | 'messages';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<any>;
}

const tabs: TabItem[] = [
  { id: 'articles', label: 'Articles', icon: Newspaper },
  { id: 'projects', label: 'Projets', icon: Briefcase },
  { id: 'team', label: 'Équipe', icon: Users },
  { id: 'services', label: 'Services', icon: Zap },
  { id: 'statistics', label: 'Stats', icon: BarChart3 },
  { id: 'pages', label: 'Pages', icon: File },
  { id: 'gallery', label: 'Galerie', icon: Image },
  { id: 'site-settings', label: 'Paramètres', icon: Mail },
  { id: 'messages', label: 'Messages', icon: Mail },
];

export default function AdminDashboardPage() {
  const { t } = useThemeLanguage();
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchAll = async () => {
    try {
      const [articlesRes, projectsRes, teamRes, servicesRes, statsRes, pagesRes, galleryRes, settingsRes, messagesRes] = await Promise.all([
        fetch('/api/articles', { credentials: 'same-origin' }),
        fetch('/api/projects', { credentials: 'same-origin' }),
        fetch('/api/team', { credentials: 'same-origin' }),
        fetch('/api/services', { credentials: 'same-origin' }),
        fetch('/api/statistics', { credentials: 'same-origin' }),
        fetch('/api/pages', { credentials: 'same-origin' }),
        fetch('/api/gallery', { credentials: 'same-origin' }),
        fetch('/api/site-settings', { credentials: 'same-origin' }),
        fetch('/api/contact', { credentials: 'same-origin' }),
      ]);

      if (articlesRes.ok) setArticles(await articlesRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (teamRes.ok) setTeamMembers(await teamRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (statsRes.ok) setStatistics(await statsRes.json());
      if (pagesRes.ok) setPages(await pagesRes.json());
      if (galleryRes.ok) setGallery(await galleryRes.json());
      if (settingsRes.ok) setSiteSettings(await settingsRes.json());
      if (messagesRes.ok) setMessages(await messagesRes.json());

      if (!articlesRes.ok || !projectsRes.ok || !teamRes.ok || !servicesRes.ok || !statsRes.ok || !pagesRes.ok || !galleryRes.ok || !settingsRes.ok || !messagesRes.ok) {
        setSessionError('Erreur lors du chargement de certaines données administratives.');
      }
    } catch (error) {
      setSessionError('Erreur lors du chargement');
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await getAdminSession();
      if (error || !data.session) {
        setSessionError(t('mustBeLoggedIn'));
        setSessionChecked(true);
        return;
      }
      setSessionChecked(true);
      await fetchAll();
      setIsLoading(false);
    };

    loadSession();
  }, [t]);

  useEffect(() => {
    setSelectedItem(null);
  }, [activeTab]);

  const handleLogout = async () => {
    await signOutAdmin();
    router.push('/admin/login');
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Confirmer la suppression ?')) return;

    try {
      const response = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      if (!response.ok) return;

      switch (type) {
        case 'articles':
          setArticles((current) => current.filter((a) => a.id !== id));
          break;
        case 'projects':
          setProjects((current) => current.filter((p) => p.id !== id));
          break;
        case 'team':
          setTeamMembers((current) => current.filter((m) => m.id !== id));
          break;
        case 'services':
          setServices((current) => current.filter((s) => s.id !== id));
          break;
        case 'statistics':
          setStatistics((current) => current.filter((s) => s.id !== id));
          break;
        case 'pages':
          setPages((current) => current.filter((p) => p.id !== id));
          break;
        case 'gallery':
          setGallery((current) => current.filter((g) => g.id !== id));
          break;
        case 'site-settings':
          setSiteSettings((current) => current.filter((setting) => setting.id !== id));
          break;
        case 'contact':
          setMessages((current) => current.filter((m) => m.id !== id));
          break;
      }
    } catch (error) {
      setSessionError('Erreur lors de la suppression');
    }
  };

  const handleMarkMessageRead = async (id: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAsRead: true }),
      });

      if (!response.ok) {
        setSessionError('Impossible de mettre à jour le message');
        return;
      }

      setMessages((current) =>
        current.map((message) => (message.id === id ? { ...message, read: true } : message)),
      );
    } catch (error) {
      setSessionError('Impossible de mettre à jour le message');
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSaving(true);

    let url = `/api/${activeTab}`;
    let method = 'POST';
    const payload: any = { ...values };

    if (activeTab === 'articles') {
      payload.tags = values.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
      payload.published_at = values.status === 'published' ? new Date().toISOString() : null;
    }

    if (values.id) {
      if (activeTab === 'articles') {
        method = 'POST';
      } else {
        url = `/api/${activeTab}/${values.id}`;
        method = 'PUT';
      }
    }

    if (activeTab === 'pages') {
      payload.published = Boolean(values.published);
    }

    if (['team', 'services', 'statistics', 'gallery'].includes(activeTab)) {
      payload.active = Boolean(values.active);
      payload.order = values.order ? Number(values.order) : 0;
    }

    if (activeTab === 'projects') {
      payload.order = values.order ? Number(values.order) : 0;
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setIsSaving(false);
    if (!response.ok) {
      setSessionError('Erreur lors de l\'enregistrement');
      return;
    }

    await fetchAll();
    setSelectedItem(null);
  };

  if (sessionChecked && sessionError) {
    return (
      <section className="min-h-[70vh] py-12">
        <div className="card mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-semibold text-white">{t('accessDenied')}</h1>
          <p className="text-slate-300">{sessionError}</p>
          <button onClick={() => router.push('/admin/login')} className="rounded-full bg-white px-6 py-3 text-black">
            {t('goToLogin')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Admin</p>
          <h1 className="text-4xl font-semibold text-white">Panneau de contrôle</h1>
          <p className="mt-2 text-slate-300">Gérez tous les contenus du site</p>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10">
          <LogOut size={16} /> {t('logout')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-300">Chargement...</div>
      ) : (
        <div>
          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
              <div className="space-y-4">
                <AdminArticleForm article={selectedItem} onSubmit={handleSubmit} isSaving={isSaving} />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 h-fit">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Articles ({articles.length})</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Nouveau
                  </button>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {articles.map((article) => (
                    <div key={article.id} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{article.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{article.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(article)}
                          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(article.id, 'articles')}
                          className="rounded-md border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="space-y-4">
                <AdminResourceForm tab="projects" resource={selectedItem} onSubmit={handleSubmit} isSaving={isSaving} />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 h-fit">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Projets ({projects.length})</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Nouveau
                  </button>
                </div>
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{project.title}</p>
                        <p className="text-sm text-slate-400 mt-1">{project.description.substring(0, 80)}...</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id, 'projects')}
                          className="rounded-md border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="space-y-4">
                <AdminResourceForm tab="team" resource={selectedItem} onSubmit={handleSubmit} isSaving={isSaving} />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 h-fit">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Équipe ({teamMembers.length})</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Nouveau
                  </button>
                </div>
                <div className="grid gap-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{member.name}</p>
                        <p className="text-sm text-slate-400">{member.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id, 'team')}
                          className="rounded-md border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="space-y-4">
                <AdminResourceForm tab="services" resource={selectedItem} onSubmit={handleSubmit} isSaving={isSaving} />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 h-fit">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Services ({services.length})</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Nouveau
                  </button>
                </div>
                <div className="grid gap-3">
                  {services.map((service) => (
                    <div key={service.id} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{service.title}</p>
                        <p className="text-sm text-slate-400 mt-1">{service.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id, 'services')}
                          className="rounded-md border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="space-y-4">
                <AdminResourceForm tab="statistics" resource={selectedItem} onSubmit={handleSubmit} isSaving={isSaving} />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 h-fit">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Statistiques ({statistics.length})</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Nouveau
                  </button>
                </div>
                <div className="grid gap-3">
                  {statistics.map((stat) => (
                    <div key={stat.id} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-slate-400 mt-2">{stat.label}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(stat)}
                          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(stat.id, 'statistics')}
                          className="rounded-md border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pages Tab */}
          {activeTab === 'pages' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="space-y-4">
                <AdminResourceForm tab="pages" resource={selectedItem} onSubmit={handleSubmit} isSaving={isSaving} />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 h-fit">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Pages ({pages.length})</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Nouveau
                  </button>
                </div>
                <div className="grid gap-3">
                  {pages.map((page) => (
                    <div key={page.id} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{page.title}</p>
                        <p className="text-sm text-slate-400">/{page.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(page)}
                          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id, 'pages')}
                          className="rounded-md border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="space-y-4">
                <AdminResourceForm tab="gallery" resource={selectedItem} onSubmit={handleSubmit} isSaving={isSaving} />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 h-fit">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Galerie ({gallery.length})</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Nouveau
                  </button>
                </div>
                <div className="grid gap-3">
                  {gallery.map((item) => (
                    <div key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-sm text-slate-400">{item.category || 'Sans catégorie'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, 'gallery')}
                          className="rounded-md border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Site Settings Tab */}
          {activeTab === 'site-settings' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="space-y-4">
                <AdminResourceForm tab="site-settings" resource={selectedItem} onSubmit={handleSubmit} isSaving={isSaving} />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 h-fit">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Paramètres ({siteSettings.length})</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    Nouveau
                  </button>
                </div>
                <div className="grid gap-3">
                  {siteSettings.map((setting) => (
                    <div key={setting.id} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{setting.key}</p>
                        <p className="text-sm text-slate-400">{setting.value}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(setting)}
                          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(setting.id, 'site-settings')}
                          className="rounded-md border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Messages ({messages.length})</h2>
              <div className="grid gap-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`rounded-lg border ${msg.read ? 'border-white/10 bg-white/5' : 'border-blue-500/40 bg-blue-500/10'} p-4`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{msg.name}</p>
                          {!msg.read && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Nouveau</span>}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{msg.subject}</p>
                        <p className="text-sm text-slate-300 mt-1">{msg.message.substring(0, 120)}...</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!msg.read && (
                          <button
                            onClick={() => handleMarkMessageRead(msg.id)}
                            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
                          >
                            Marquer lu
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(msg.id, 'contact')}
                          className="rounded-md border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {sessionError && <p className="text-sm text-red-400 p-4 bg-red-500/10 rounded-lg">{sessionError}</p>}
    </section>
  );
}
