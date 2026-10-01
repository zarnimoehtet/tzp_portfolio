-- =============================================================================
-- Photographer portfolio — initial schema
-- Single-photographer project: settings tables are singletons (one row each).
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admins
-- Only users listed here can manage content. Add the photographer manually:
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com';
-- -----------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Albums
-- -----------------------------------------------------------------------------

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  category text,
  cover_photo_id uuid,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint albums_slug_key unique (slug)
);

create index albums_sort_order_idx on public.albums (sort_order, created_at);
create index albums_published_idx on public.albums (is_published, sort_order);

create trigger albums_set_updated_at
before update on public.albums
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Photos — stores R2 URLs/keys only, never image binaries.
-- -----------------------------------------------------------------------------

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid,
  title text,
  description text,
  alt_text text,
  storage_key text not null,
  image_url text not null,
  medium_url text not null,
  thumbnail_url text not null,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  blur_data_url text,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint photos_album_id_fkey foreign key (album_id)
    references public.albums (id) on delete set null
);

create index photos_album_sort_idx on public.photos (album_id, sort_order, created_at);
create index photos_featured_idx on public.photos (sort_order)
  where is_featured and is_published;
create index photos_created_at_idx on public.photos (created_at desc);

create trigger photos_set_updated_at
before update on public.photos
for each row execute function public.set_updated_at();

alter table public.albums
  add constraint albums_cover_photo_id_fkey foreign key (cover_photo_id)
  references public.photos (id) on delete set null;

create index albums_cover_photo_idx on public.albums (cover_photo_id);

-- -----------------------------------------------------------------------------
-- Packages
-- -----------------------------------------------------------------------------

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  price numeric(12, 2) check (price is null or price >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  duration text,
  cta_label text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packages_slug_key unique (slug)
);

create index packages_sort_order_idx on public.packages (is_published, sort_order);

create trigger packages_set_updated_at
before update on public.packages
for each row execute function public.set_updated_at();

create table public.package_features (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null,
  feature text not null check (char_length(feature) between 1 and 200),
  sort_order integer not null default 0,
  constraint package_features_package_id_fkey foreign key (package_id)
    references public.packages (id) on delete cascade
);

create index package_features_package_idx on public.package_features (package_id, sort_order);

-- -----------------------------------------------------------------------------
-- Testimonials
-- -----------------------------------------------------------------------------

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  role text,
  content text not null check (char_length(content) between 1 and 2000),
  avatar jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index testimonials_sort_order_idx on public.testimonials (is_published, sort_order);

create trigger testimonials_set_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Singletons: about, contact_settings, site_settings
-- `id boolean primary key default true check (id)` guarantees one row.
-- -----------------------------------------------------------------------------

create table public.about (
  id boolean primary key default true check (id),
  name text not null default 'Your Name',
  headline text,
  introduction text,
  biography text,
  experience text,
  years_experience integer check (years_experience is null or years_experience >= 0),
  specialties text[] not null default '{}',
  personal_message text,
  profile_image jsonb,
  updated_at timestamptz not null default now()
);

create trigger about_set_updated_at
before update on public.about
for each row execute function public.set_updated_at();

create table public.contact_settings (
  id boolean primary key default true check (id),
  email text,
  phone text,
  location text,
  availability text,
  instagram text,
  facebook text,
  tiktok text,
  whatsapp text,
  other_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger contact_settings_set_updated_at
before update on public.contact_settings
for each row execute function public.set_updated_at();

create table public.site_settings (
  id boolean primary key default true check (id),
  photographer_name text not null default 'Photographer Name',
  logo jsonb,
  favicon jsonb,
  hero_image jsonb,
  hero_title text not null default 'Capturing stories, people & unforgettable moments.',
  hero_subtitle text,
  primary_color text not null default '#161616' check (primary_color ~ '^#[0-9a-fA-F]{6}$'),
  secondary_color text not null default '#f7f5f1' check (secondary_color ~ '^#[0-9a-fA-F]{6}$'),
  font_preset text not null default 'classic',
  template text not null default 'minimal',
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

insert into public.about (id) values (true);
insert into public.contact_settings (id) values (true);
insert into public.site_settings (id) values (true);

-- -----------------------------------------------------------------------------
-- Inquiries (contact form submissions)
-- -----------------------------------------------------------------------------

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  event_type text check (event_type is null or char_length(event_type) <= 80),
  event_date date,
  package_name text check (package_name is null or char_length(package_name) <= 120),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create index inquiries_created_at_idx on public.inquiries (created_at desc);
create index inquiries_status_idx on public.inquiries (status, created_at desc);

-- -----------------------------------------------------------------------------
-- Reordering helper (runs as the caller, so RLS still applies)
-- -----------------------------------------------------------------------------

create or replace function public.reorder_items(p_table text, p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_table not in ('albums', 'photos', 'packages', 'testimonials') then
    raise exception 'Invalid table: %', p_table;
  end if;

  execute format(
    'update public.%I as t set sort_order = o.ord - 1
       from unnest($1::uuid[]) with ordinality as o(id, ord)
      where t.id = o.id',
    p_table
  ) using p_ids;
end;
$$;

revoke all on function public.reorder_items(text, uuid[]) from public, anon;
grant execute on function public.reorder_items(text, uuid[]) to authenticated;

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.admins enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.packages enable row level security;
alter table public.package_features enable row level security;
alter table public.testimonials enable row level security;
alter table public.about enable row level security;
alter table public.contact_settings enable row level security;
alter table public.site_settings enable row level security;
alter table public.inquiries enable row level security;

-- admins: a signed-in user may only see whether they themselves are an admin.
create policy "admins: read own row" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- albums
create policy "albums: public read published" on public.albums
  for select to anon, authenticated
  using (is_published or (select public.is_admin()));

create policy "albums: admin write" on public.albums
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- photos: visible when published and not inside an unpublished album.
create policy "photos: public read published" on public.photos
  for select to anon, authenticated
  using (
    (select public.is_admin())
    or (
      is_published
      and (
        album_id is null
        or exists (
          select 1 from public.albums a
          where a.id = photos.album_id and a.is_published
        )
      )
    )
  );

create policy "photos: admin write" on public.photos
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- packages
create policy "packages: public read published" on public.packages
  for select to anon, authenticated
  using (is_published or (select public.is_admin()));

create policy "packages: admin write" on public.packages
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "package_features: public read" on public.package_features
  for select to anon, authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.packages p
      where p.id = package_features.package_id and p.is_published
    )
  );

create policy "package_features: admin write" on public.package_features
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- testimonials
create policy "testimonials: public read published" on public.testimonials
  for select to anon, authenticated
  using (is_published or (select public.is_admin()));

create policy "testimonials: admin write" on public.testimonials
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- singletons: public read, admin update.
create policy "about: public read" on public.about
  for select to anon, authenticated using (true);
create policy "about: admin update" on public.about
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "contact_settings: public read" on public.contact_settings
  for select to anon, authenticated using (true);
create policy "contact_settings: admin update" on public.contact_settings
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "site_settings: public read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings: admin update" on public.site_settings
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- inquiries: anyone may submit, only admins may read/manage.
create policy "inquiries: public insert" on public.inquiries
  for insert to anon, authenticated
  with check (status = 'new');

create policy "inquiries: admin read" on public.inquiries
  for select to authenticated
  using ((select public.is_admin()));

create policy "inquiries: admin update" on public.inquiries
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "inquiries: admin delete" on public.inquiries
  for delete to authenticated
  using ((select public.is_admin()));
