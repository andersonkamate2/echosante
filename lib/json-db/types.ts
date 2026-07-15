import type { Article } from '@/types/article';
import type { GalleryItem, PageContent } from '@/types/content';

export type JsonEntity =
  | 'articles'
  | 'projects'
  | 'team'
  | 'services'
  | 'statistics'
  | 'pages'
  | 'gallery'
  | 'site-settings'
  | 'contact-messages'
  | 'admin-users';

export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Project extends BaseRecord {
  title: string;
  slug: string;
  description: string;
  image_url?: string | null;
  status: string;
  order: number;
}

export interface TeamMember extends BaseRecord {
  name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  image_url?: string | null;
  bio?: string | null;
  order: number;
  active: boolean;
}

export interface Service extends BaseRecord {
  title: string;
  description: string;
  icon?: string | null;
  order: number;
  active: boolean;
}

export interface Statistic extends BaseRecord {
  label: string;
  value: string;
  order: number;
  active: boolean;
}

export interface SiteSetting extends BaseRecord {
  key: string;
  value: string;
  description?: string | null;
}

export interface ContactMessage extends BaseRecord {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string | null;
  read: boolean;
  replied: boolean;
  reply?: string | null;
}

export interface AdminUser extends BaseRecord {
  email: string;
  passwordHash: string;
  passwordSalt: string;
}

export interface EntityMap {
  articles: Article;
  projects: Project;
  team: TeamMember;
  services: Service;
  statistics: Statistic;
  pages: PageContent;
  gallery: GalleryItem;
  'site-settings': SiteSetting;
  'contact-messages': ContactMessage;
  'admin-users': AdminUser;
}
