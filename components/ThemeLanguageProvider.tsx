'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';
type Language = 'fr' | 'en';

interface ThemeLanguageContextValue {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (value: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    home: 'Accueil',
    about: 'À propos',
    projects: 'Projets',
    articles: 'Articles',
    contact: 'Contact',
    adminLogin: 'Connexion Admin',
    adminDashboard: 'Dashboard Admin',
    admin: 'Admin',
    loginTitle: 'Connexion',
    loginDescription: 'Connectez-vous avec vos identifiants Supabase pour gérer les articles.',
    email: 'Email',
    password: 'Mot de passe',
    emailPlaceholder: 'admin@echosante.org',
    passwordPlaceholder: '••••••••',
    connecting: 'Connexion…',
    signIn: 'Se connecter',
    theme: 'Thème',
    light: 'Clair',
    dark: 'Sombre',
    language: 'Langue',
    french: 'Français',
    english: 'Anglais',
    accessDenied: 'Accès refusé',
    mustBeLoggedIn: 'Vous devez être connecté pour accéder au dashboard.',
    goToLogin: 'Aller à la connexion',
    published: 'Publiés',
    articleList: 'Liste d’articles',
    logout: 'Déconnexion',
    createOrEdit: 'Créer ou modifier un article',
    dashboardDescription: 'Gérez les articles publiés et les brouillons directement depuis Supabase.',
    loading: 'Chargement en cours…',
    deleteConfirm: 'Confirmer la suppression de cet article ?',
    articleFormTitle: 'Créer ou modifier un article',
    articleFormSubtitle: 'Administration',
    title: 'Titre',
    slug: 'Slug',
    category: 'Catégorie',
    status: 'Statut',
    draft: 'Brouillon',
    publishedStatus: 'Publié',
    excerpt: 'Accroche',
    coverImage: 'Image de couverture',
    content: 'Contenu',
    author: 'Auteur',
    tags: 'Tags',
    saveArticle: 'Enregistrer l’article',
    saving: 'Enregistrement…',
    titlePlaceholder: 'Titre de l’article',
    slugPlaceholder: 'slug-article',
    categoryPlaceholder: 'Santé, Éducation, Partenariat',
    excerptPlaceholder: 'Résumé rapide',
    coverImagePlaceholder: 'https://...',
    contentPlaceholder: 'Contenu détaillé de l’article',
    authorPlaceholder: 'Nom de l’auteur',
    tagsPlaceholder: 'santé, éducation, partenariat',
  },
  en: {
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    articles: 'Articles',
    contact: 'Contact',
    adminLogin: 'Admin Login',
    adminDashboard: 'Admin Dashboard',
    admin: 'Admin',
    loginTitle: 'Login',
    loginDescription: 'Sign in with your Supabase credentials to manage articles.',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'admin@echosante.org',
    passwordPlaceholder: '••••••••',
    connecting: 'Signing in…',
    signIn: 'Sign in',
    theme: 'Theme',
    light: 'Light',
    dark: 'Night',
    language: 'Language',
    french: 'Français',
    english: 'English',
    accessDenied: 'Access denied',
    mustBeLoggedIn: 'You must be logged in to access the dashboard.',
    goToLogin: 'Go to login',
    published: 'Published',
    articleList: 'Article list',
    logout: 'Logout',
    createOrEdit: 'Create or edit an article',
    dashboardDescription: 'Manage published articles and drafts directly from Supabase.',
    loading: 'Loading…',
    deleteConfirm: 'Confirm deleting this article?',
    articleFormTitle: 'Create or edit an article',
    articleFormSubtitle: 'Administration',
    title: 'Title',
    slug: 'Slug',
    category: 'Category',
    status: 'Status',
    draft: 'Draft',
    publishedStatus: 'Published',
    excerpt: 'Excerpt',
    coverImage: 'Cover image',
    content: 'Content',
    author: 'Author',
    tags: 'Tags',
    saveArticle: 'Save article',
    saving: 'Saving…',
    titlePlaceholder: 'Article title',
    slugPlaceholder: 'article-slug',
    categoryPlaceholder: 'Health, Education, Partnership',
    excerptPlaceholder: 'Short summary',
    coverImagePlaceholder: 'https://...',
    contentPlaceholder: 'Detailed article content',
    authorPlaceholder: 'Author name',
    tagsPlaceholder: 'health, education, partnership',
  },
};

const ThemeLanguageContext = createContext<ThemeLanguageContextValue | undefined>(undefined);

export function ThemeLanguageProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedLanguage = localStorage.getItem('language') as Language | null;

    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    }

    if (storedLanguage === 'fr' || storedLanguage === 'en') {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.lang = language;
    localStorage.setItem('theme', theme);
    localStorage.setItem('language', language);
  }, [theme, language]);

  const toggleTheme = () => setTheme((current) => (current === 'light' ? 'dark' : 'light'));

  const t = useMemo(
    () => (key: string) => translations[language][key] ?? translations.fr[key] ?? key,
    [language]
  );

  return (
    <ThemeLanguageContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within ThemeLanguageProvider');
  }
  return context;
}
