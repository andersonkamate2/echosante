/**
 * PostgreSQL Schema and RLS Policies for Echo Santé Supabase
 * 
 * This script sets up the complete database schema with Row Level Security (RLS)
 * to ensure:
 * - Published content is accessible to everyone (anon key)
 * - Draft content and admin operations are restricted to admins
 * - All tables have proper indexes and constraints
 */

-- ============================================================================
-- AUTHENTICATION & PROFILES
-- ============================================================================

create table if not exists public.admin_role (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'user')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.admin_role enable row level security;

create policy "admin_role_self_read" on public.admin_role for select
  using (auth.uid() = user_id);

-- ============================================================================
-- ARTICLES WITH PUBLISHED/DRAFT STATUS
-- ============================================================================

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  cover_image text,
  author text,
  category text,
  tags text[] default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.articles enable row level security;

create policy "articles_published_public_select" on public.articles for select
  using (status = 'published');

create policy "articles_admin_all" on public.articles for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists articles_status_idx on public.articles(status);
create index if not exists articles_slug_idx on public.articles(slug);
create index if not exists articles_category_idx on public.articles(category);
create index if not exists articles_published_at_idx on public.articles(published_at desc);

-- ============================================================================
-- PAGE CONTENTS WITH PUBLISHED FLAG
-- ============================================================================

create table if not exists public.page_contents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null,
  meta_description text,
  "order" integer default 0,
  published boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.page_contents enable row level security;

create policy "page_contents_published_public_select" on public.page_contents for select
  using (published = true);

create policy "page_contents_admin_all" on public.page_contents for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists page_contents_slug_idx on public.page_contents(slug);
create index if not exists page_contents_published_idx on public.page_contents(published);
create index if not exists page_contents_order_idx on public.page_contents("order");

-- ============================================================================
-- SITE SETTINGS
-- ============================================================================

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  description text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.site_settings enable row level security;

create policy "site_settings_public_select" on public.site_settings for select
  using (true);

create policy "site_settings_admin_all" on public.site_settings for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists site_settings_key_idx on public.site_settings(key);

-- ============================================================================
-- GALLERY WITH ACTIVE/INACTIVE STATUS
-- ============================================================================

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  description text,
  category text default 'general',
  "order" integer default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.gallery enable row level security;

create policy "gallery_active_public_select" on public.gallery for select
  using (active = true);

create policy "gallery_admin_all" on public.gallery for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists gallery_active_idx on public.gallery(active);
create index if not exists gallery_category_idx on public.gallery(category);
create index if not exists gallery_order_idx on public.gallery("order");

-- ============================================================================
-- PROJECTS (PUBLIC AND ADMIN MANAGED)
-- ============================================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  image_url text,
  status text default 'active' check (status in ('active', 'archived')),
  "order" integer default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.projects enable row level security;

create policy "projects_active_public_select" on public.projects for select
  using (status = 'active');

create policy "projects_admin_all" on public.projects for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_slug_idx on public.projects(slug);

-- ============================================================================
-- TEAM MEMBERS (ACTIVE/INACTIVE)
-- ============================================================================

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  email text,
  phone text,
  image_url text,
  bio text,
  "order" integer default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.team_members enable row level security;

create policy "team_members_active_public_select" on public.team_members for select
  using (active = true);

create policy "team_members_admin_all" on public.team_members for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists team_members_active_idx on public.team_members(active);
create index if not exists team_members_order_idx on public.team_members("order");

-- ============================================================================
-- SERVICES (ACTIVE/INACTIVE)
-- ============================================================================

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text,
  "order" integer default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.services enable row level security;

create policy "services_active_public_select" on public.services for select
  using (active = true);

create policy "services_admin_all" on public.services for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists services_active_idx on public.services(active);
create index if not exists services_order_idx on public.services("order");

-- ============================================================================
-- STATISTICS (ACTIVE/INACTIVE)
-- ============================================================================

create table if not exists public.statistics (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  "order" integer default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.statistics enable row level security;

create policy "statistics_active_public_select" on public.statistics for select
  using (active = true);

create policy "statistics_admin_all" on public.statistics for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists statistics_active_idx on public.statistics(active);
create index if not exists statistics_order_idx on public.statistics("order");

-- ============================================================================
-- CONTACT MESSAGES (ADMIN ONLY)
-- ============================================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  phone text,
  read boolean not null default false,
  replied boolean not null default false,
  reply text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact_messages_public_insert" on public.contact_messages for insert
  with check (true);

create policy "contact_messages_admin_select" on public.contact_messages for select
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create policy "contact_messages_admin_update" on public.contact_messages for update
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create policy "contact_messages_admin_delete" on public.contact_messages for delete
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists contact_messages_read_idx on public.contact_messages(read);
create index if not exists contact_messages_replied_idx on public.contact_messages(replied);
create index if not exists contact_messages_email_idx on public.contact_messages(email);

-- ============================================================================
-- COMMENTS & TESTIMONIALS
-- ============================================================================

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  avatar_url text,
  content text not null,
  published boolean not null default false,
  "order" integer default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.testimonials enable row level security;

create policy "testimonials_published_public_select" on public.testimonials for select
  using (published = true);

create policy "testimonials_admin_all" on public.testimonials for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists testimonials_published_idx on public.testimonials(published);
create index if not exists testimonials_order_idx on public.testimonials("order");

-- ============================================================================
-- EVENTS/ACTIVITIES
-- ============================================================================

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  image_url text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  location text,
  status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  published boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.events enable row level security;

create policy "events_published_public_select" on public.events for select
  using (published = true);

create policy "events_admin_all" on public.events for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists events_published_idx on public.events(published);
create index if not exists events_status_idx on public.events(status);
create index if not exists events_start_date_idx on public.events(start_date desc);
create index if not exists events_slug_idx on public.events(slug);

-- ============================================================================
-- PARTNERS/SPONSORS
-- ============================================================================

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  website_url text,
  description text,
  category text default 'partner' check (category in ('partner', 'sponsor', 'supporter')),
  "order" integer default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.partners enable row level security;

create policy "partners_active_public_select" on public.partners for select
  using (active = true);

create policy "partners_admin_all" on public.partners for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists partners_active_idx on public.partners(active);
create index if not exists partners_category_idx on public.partners(category);

-- ============================================================================
-- CATEGORIES & TAGS (FOR ARTICLES)
-- ============================================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  "order" integer default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

alter table public.categories enable row level security;

create policy "categories_active_public_select" on public.categories for select
  using (active = true);

create policy "categories_admin_all" on public.categories for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists categories_slug_idx on public.categories(slug);
create index if not exists categories_active_idx on public.categories(active);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  "order" integer default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

alter table public.tags enable row level security;

create policy "tags_active_public_select" on public.tags for select
  using (active = true);

create policy "tags_admin_all" on public.tags for all
  using (exists (
    select 1 from public.admin_role
    where user_id = auth.uid() and role = 'admin'
  ));

create index if not exists tags_slug_idx on public.tags(slug);
create index if not exists tags_active_idx on public.tags(active);
