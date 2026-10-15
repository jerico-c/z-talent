-- Jalankan setelah Firebase ditambahkan sebagai Third-party Auth provider
-- di Supabase Dashboard > Authentication > Third-party Auth.
-- File ini mengganti policy lama yang masih memeriksa role=admin.

drop policy if exists "Authenticated admins manage training" on public.training_posts;
drop policy if exists "Authenticated admins manage training assets" on public.training_assets;
drop policy if exists "Authenticated admins manage news" on public.news_posts;
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
