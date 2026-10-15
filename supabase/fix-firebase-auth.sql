-- Jalankan setelah Firebase ditambahkan sebagai Third-party Auth provider
-- di Supabase Dashboard > Authentication > Third-party Auth.
-- File ini mengganti policy lama yang masih memeriksa role=admin.

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

alter table public.courses enable row level security;

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

alter table public.promotions enable row level security;

drop policy if exists "Authenticated admins manage training" on public.training_posts;
drop policy if exists "Authenticated admins manage training assets" on public.training_assets;
drop policy if exists "Authenticated admins manage news" on public.news_posts;
drop policy if exists "Authenticated admins manage courses" on public.courses;
drop policy if exists "Published courses are public" on public.courses;
drop policy if exists "Published promotions are public" on public.promotions;
drop policy if exists "Users create promotions" on public.promotions;
drop policy if exists "Owners update promotions" on public.promotions;
drop policy if exists "Owners and admins delete promotions" on public.promotions;
drop policy if exists "Admins upload content assets" on storage.objects;
drop policy if exists "Admins update content assets" on storage.objects;
drop policy if exists "Admins delete content assets" on storage.objects;

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

create policy "Published courses are public"
  on public.courses for select
  using (status = 'published');

create policy "Published promotions are public"
  on public.promotions for select
  using (status = 'published');

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

drop policy if exists "Users upload promotion assets" on storage.objects;
drop policy if exists "Owners delete promotion assets" on storage.objects;

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
      ((storage.foldername(name))[1] = 'promotions'
        and (storage.foldername(name))[2] = (auth.jwt() ->> 'sub'))
      or (auth.jwt() ->> 'admin') = 'true'
    )
  );
