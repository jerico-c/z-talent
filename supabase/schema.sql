-- Jalankan file ini di Supabase SQL Editor.
-- Bucket content-assets menyimpan materi pelatihan dan gambar news.

create extension if not exists "pgcrypto";

create table if not exists public.training_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 160),
  slug text not null unique,
  provider text not null check (char_length(provider) between 2 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  delivery_mode text not null default 'online' check (delivery_mode in ('online', 'offline')),
  content_type text not null default 'manual' check (content_type in ('manual', 'pdf', 'html')),
  content_html text not null default '',
  content_url text,
  cover_image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  venue text,
  address text,
  capacity integer check (capacity is null or capacity > 0),
  registration_url text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offline_schedule_required check (
    delivery_mode = 'online' or (starts_at is not null and venue is not null and char_length(venue) > 0)
  ),
  constraint content_required check (
    (content_type = 'manual' and char_length(content_html) > 0)
    or (content_type in ('pdf', 'html') and content_url is not null)
  )
);

create table if not exists public.training_assets (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.training_posts(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  file_name text not null,
  mime_type text not null,
  file_size integer not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  slug text not null unique,
  excerpt text not null default '',
  content_html text not null default '',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 160),
  provider text not null check (char_length(provider) between 2 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  content_type text not null default 'manual' check (content_type in ('manual', 'pdf', 'html')),
  content_html text not null default '',
  content_url text,
  cover_image_url text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_content_required check (
    (content_type = 'manual' and char_length(content_html) > 0)
    or (content_type in ('pdf', 'html') and content_url is not null)
  )
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (char_length(category) between 2 and 60),
  description text not null default '' check (char_length(description) <= 2000),
  city text not null check (char_length(city) between 2 and 100),
  contact text not null default '' check (char_length(contact) <= 120),
  link text not null default '#',
  image_url text,
  status text not null default 'published' check (status in ('draft', 'published', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.training_posts enable row level security;
alter table public.training_assets enable row level security;
alter table public.news_posts enable row level security;
alter table public.courses enable row level security;
alter table public.promotions enable row level security;

create policy "Published training is public"
  on public.training_posts for select
  using (status = 'published');

create policy "Training assets are public"
  on public.training_assets for select
  using (exists (
    select 1 from public.training_posts
    where id = training_id and status = 'published'
  ));

create policy "Published news is public"
  on public.news_posts for select
  using (status = 'published');

create policy "Published courses are public"
  on public.courses for select
  using (status = 'published');

create policy "Published promotions are public"
  on public.promotions for select
  using (status = 'published');

-- Aplikasi menggunakan Firebase Authentication sebagai identity provider.
-- Supabase harus dikonfigurasi untuk menerima Firebase JWT terlebih dahulu.
-- Claim admin berasal dari Firebase custom claim: { "admin": true }.
create policy "Authenticated admins manage training"
  on public.training_posts for all
  to authenticated
  using ((auth.jwt() ->> 'admin') = 'true')
  with check ((auth.jwt() ->> 'admin') = 'true');

create policy "Authenticated admins manage training assets"
  on public.training_assets for all
  to authenticated
  using ((auth.jwt() ->> 'admin') = 'true')
  with check ((auth.jwt() ->> 'admin') = 'true');

create policy "Authenticated admins manage news"
  on public.news_posts for all
  to authenticated
  using ((auth.jwt() ->> 'admin') = 'true')
  with check ((auth.jwt() ->> 'admin') = 'true');

create policy "Authenticated admins manage courses"
  on public.courses for all
  to authenticated
  using ((auth.jwt() ->> 'admin') = 'true')
  with check ((auth.jwt() ->> 'admin') = 'true');

create policy "Users create promotions"
  on public.promotions for insert
  to public
  with check (
    (auth.jwt() ->> 'sub') is not null
    and owner_id = (auth.jwt() ->> 'sub')
    and status = 'published'
  );

create policy "Owners update promotions"
  on public.promotions for update
  to public
  using (
    (auth.jwt() ->> 'sub') is not null
    and (
    owner_id = (auth.jwt() ->> 'sub')
    or (auth.jwt() ->> 'admin') = 'true'
    )
  )
  with check (
    (auth.jwt() ->> 'sub') is not null
    and (
    owner_id = (auth.jwt() ->> 'sub')
    or (auth.jwt() ->> 'admin') = 'true'
    )
  );

create policy "Owners and admins delete promotions"
  on public.promotions for delete
  to public
  using (
    (auth.jwt() ->> 'sub') is not null
    and (
    owner_id = (auth.jwt() ->> 'sub')
    or (auth.jwt() ->> 'admin') = 'true'
    )
  );

insert into storage.buckets (id, name, public)
values ('content-assets', 'content-assets', true)
on conflict (id) do nothing;

create policy "Public content assets are readable"
  on storage.objects for select
  using (bucket_id = 'content-assets');

create policy "Admins upload content assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'content-assets' and (auth.jwt() ->> 'admin') = 'true');

create policy "Admins update content assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'content-assets' and (auth.jwt() ->> 'admin') = 'true');

create policy "Admins delete content assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'content-assets' and (auth.jwt() ->> 'admin') = 'true');

create policy "Users upload promotion assets"
  on storage.objects for insert
  to public
  with check (
    (auth.jwt() ->> 'sub') is not null
    and bucket_id = 'content-assets'
    and (storage.foldername(name))[1] = 'promotions'
    and (storage.foldername(name))[2] = (auth.jwt() ->> 'sub')
  );

create policy "Owners delete promotion assets"
  on storage.objects for delete
  to public
  using (
    (auth.jwt() ->> 'sub') is not null
    and bucket_id = 'content-assets'
    and (
      (storage.foldername(name))[1] = 'promotions'
      and (storage.foldername(name))[2] = (auth.jwt() ->> 'sub')
      or (auth.jwt() ->> 'admin') = 'true'
    )
  );
