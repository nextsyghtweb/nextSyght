-- =====================================================================
--  NEXTSYGHT – Supabase database setup
-- =====================================================================
--  HOW TO USE
--  1. Replace YOUR_ADMIN_EMAIL (in the is_admin() function below) with the
--     email address you will use to log in to /admin.
--  2. In Supabase open: SQL Editor -> New query -> paste this whole file -> Run.
--  3. This script is safe to run again if you ever need to.
--
--  WHAT IT CREATES
--  - site_settings : ONE row holding contact details, social links, hero
--                    text, services and testimonials (as JSON).
--  - projects      : your portfolio projects.
--  - project-images: a public storage bucket for project screenshots.
--  - Security rules (Row Level Security): EVERYONE can read, but only the
--    logged-in admin email can create / edit / delete.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Who is the admin?  >>> EDIT THE EMAIL ON THE LINE MARKED  <<<
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('nextsyght.web@gmail.com');  -- <<< EDIT THIS
$$;

-- ---------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id          int primary key default 1 check (id = 1),   -- always a single row
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Empty settings row: the website merges it over its built-in defaults.
insert into public.site_settings (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  category     text not null default 'websites'
               check (category in ('websites', 'ecommerce', 'webapps')),
  tags         text[] not null default '{}',
  link         text not null default '',
  image_url    text not null default '',
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Row Level Security: public read, admin-only write
-- ---------------------------------------------------------------------
alter table public.site_settings enable row level security;
alter table public.projects      enable row level security;

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Admin can write settings" on public.site_settings;
create policy "Admin can write settings"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
  on public.projects for select
  using (true);

drop policy if exists "Admin can write projects" on public.projects;
create policy "Admin can write projects"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. Image storage (public bucket, admin-only uploads)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view project images" on storage.objects;
create policy "Public can view project images"
  on storage.objects for select
  using (bucket_id = 'project-images');

drop policy if exists "Admin can manage project images" on storage.objects;
create policy "Admin can manage project images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'project-images' and public.is_admin())
  with check (bucket_id = 'project-images' and public.is_admin());

-- ---------------------------------------------------------------------
-- 5. Sample projects (only inserted if the table is empty).
--    Edit or delete them from /admin once you're logged in.
-- ---------------------------------------------------------------------
insert into public.projects (title, description, category, tags, link, image_url, sort_order)
select v.title, v.description, v.category, v.tags, v.link, v.image_url, v.sort_order
from (
  values
    ('Project One',
     'A modern business website with a clean design, fast loading and strong SEO foundations.',
     'websites', array['React','Tailwind','SEO']::text[],
     'https://example.com', '/placeholders/project-1.svg', 1),
    ('Project Two',
     'A full e-commerce store with product catalogue, cart, secure checkout and order management.',
     'ecommerce', array['Shopify','Payments','Mobile-first']::text[],
     'https://example.com', '/placeholders/project-2.svg', 2),
    ('Project Three',
     'A custom web app with a secure login, live dashboard and role-based access for a growing team.',
     'webapps', array['React','Supabase','Dashboard']::text[],
     'https://example.com', '/placeholders/project-3.svg', 3),
    ('Project Four',
     'A complete redesign of an outdated website, with a new look, better UX and faster performance.',
     'websites', array['Redesign','UX','Performance']::text[],
     'https://example.com', '/placeholders/project-4.svg', 4)
) as v(title, description, category, tags, link, image_url, sort_order)
where not exists (select 1 from public.projects);
