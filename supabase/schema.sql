create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  location text not null default '',
  price numeric,
  status text not null default 'active',
  images text[] not null default '{}',
  category text not null default '',
  project_url text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  phone_1 text not null default '',
  phone_2 text not null default '',
  whatsapp_number text not null default '',
  email text not null default '',
  address text not null default '',
  instagram_url text not null default '',
  twitter_url text not null default '',
  telegram_url text not null default '',
  linkedin_url text not null default ''
);

alter table public.site_settings add column if not exists instagram_url text not null default '';
alter table public.site_settings add column if not exists twitter_url text not null default '';
alter table public.site_settings add column if not exists telegram_url text not null default '';
alter table public.site_settings add column if not exists linkedin_url text not null default '';

insert into public.site_settings (
  id, phone_1, phone_2, whatsapp_number, email, address,
  instagram_url, twitter_url, telegram_url, linkedin_url
)
values (
  1,
  '+91 00000 00000',
  '',
  '',
  'hello@dukaandigital.in',
  'Shrirampur, West Bengal, IN',
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null default '',
  email text not null,
  message text not null,
  project_id uuid references public.projects(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business text not null default '',
  rating integer not null check (rating between 1 and 5),
  review_text text not null,
  approved boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.projects
  add column if not exists location text not null default '',
  add column if not exists price numeric,
  add column if not exists status text not null default 'active',
  add column if not exists images text[] not null default '{}',
  add column if not exists category text not null default '',
  add column if not exists project_url text not null default '';

alter table public.enquiries
  add column if not exists is_read boolean not null default false;

alter table public.projects enable row level security;
alter table public.site_settings enable row level security;
alter table public.enquiries enable row level security;
alter table public.reviews enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.projects, public.site_settings, public.reviews to anon, authenticated;
grant select, insert, update, delete on public.projects, public.site_settings, public.enquiries, public.reviews to service_role;
grant insert on public.enquiries, public.reviews to anon, authenticated;
grant update on public.enquiries, public.reviews to authenticated;
grant delete on public.enquiries, public.reviews to authenticated;

drop policy if exists "Public read projects" on public.projects;
create policy "Public read projects"
on public.projects for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated manage projects" on public.projects;
create policy "Authenticated manage projects"
on public.projects for all
to authenticated
using ((auth.jwt()->>'email') = 'nextsyght.web@gmail.com')
with check ((auth.jwt()->>'email') = 'nextsyght.web@gmail.com');

drop policy if exists "Public read settings" on public.site_settings;
create policy "Public read settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated manage settings" on public.site_settings;
create policy "Authenticated manage settings"
on public.site_settings for all
to authenticated
using ((auth.jwt()->>'email') = 'nextsyght.web@gmail.com')
with check ((auth.jwt()->>'email') = 'nextsyght.web@gmail.com');

drop policy if exists "Public insert enquiries" on public.enquiries;
create policy "Public insert enquiries"
on public.enquiries for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated read enquiries" on public.enquiries;
create policy "Authenticated read enquiries"
on public.enquiries for select
to authenticated
using ((auth.jwt()->>'email') = 'nextsyght.web@gmail.com');

drop policy if exists "Authenticated update enquiries" on public.enquiries;
create policy "Authenticated update enquiries"
on public.enquiries for update
to authenticated
using ((auth.jwt()->>'email') = 'nextsyght.web@gmail.com')
with check ((auth.jwt()->>'email') = 'nextsyght.web@gmail.com');

drop policy if exists "Authenticated delete enquiries" on public.enquiries;
create policy "Authenticated delete enquiries"
on public.enquiries for delete
to authenticated
using ((auth.jwt()->>'email') = 'nextsyght.web@gmail.com');

drop policy if exists "Public read approved reviews" on public.reviews;
create policy "Public read approved reviews"
on public.reviews for select
to anon, authenticated
using (approved = true);

drop policy if exists "Public insert reviews" on public.reviews;
create policy "Public insert reviews"
on public.reviews for insert
to anon, authenticated
with check (approved = true);

drop policy if exists "Authenticated manage reviews" on public.reviews;
create policy "Authenticated manage reviews"
on public.reviews for all
to authenticated
using ((auth.jwt()->>'email') = 'nextsyght.web@gmail.com')
with check ((auth.jwt()->>'email') = 'nextsyght.web@gmail.com');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read project images" on storage.objects;
create policy "Public read project images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'project-images');

drop policy if exists "Authenticated upload project images" on storage.objects;
create policy "Authenticated upload project images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'project-images'
  and (auth.jwt()->>'email') = 'nextsyght.web@gmail.com'
);

drop policy if exists "Authenticated replace project images" on storage.objects;
create policy "Authenticated replace project images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'project-images'
  and (auth.jwt()->>'email') = 'nextsyght.web@gmail.com'
)
with check (
  bucket_id = 'project-images'
  and (auth.jwt()->>'email') = 'nextsyght.web@gmail.com'
);

drop policy if exists "Authenticated delete project images" on storage.objects;
create policy "Authenticated delete project images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project-images'
  and (auth.jwt()->>'email') = 'nextsyght.web@gmail.com'
);
