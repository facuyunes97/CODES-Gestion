-- Codes 1.30: anuncios automáticos (aviso de IVA el 20 de cada mes) y de calendario; cada usuario marca los suyos como entendidos.
create table if not exists public.anuncios_leidos (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  ref text not null,
  leido_at timestamptz not null default now(),
  primary key (user_id, ref)
);
alter table public.anuncios_leidos enable row level security;
create policy anul_sel on public.anuncios_leidos for select to authenticated using (user_id = auth.uid());
create policy anul_ins on public.anuncios_leidos for insert to authenticated with check (user_id = auth.uid());
create policy anul_del on public.anuncios_leidos for delete to authenticated using (user_id = auth.uid());
create policy anu_del on public.anuncios for delete to authenticated using (user_id = auth.uid());
create or replace function public.purgar_anuncios_leidos() returns void language sql security definer set search_path to 'public' as $$
  delete from public.anuncios_leidos where leido_at < now() - interval '90 days';
$$;
