-- Papelera: todo lo que se borra desde la app queda acá 21 días (3 semanas) y se puede restaurar.
create table if not exists public.papelera (
  id uuid primary key default gen_random_uuid(),
  col text not null,            -- clave interna de la app (facturas, cheques, trans, ...)
  tabla text not null,          -- tabla de origen
  registro_id text not null,
  etiqueta text not null default '',
  datos jsonb not null,         -- el registro tal como estaba (formato de la base)
  borrado_at timestamptz not null default now(),
  borrado_por uuid default auth.uid(),
  borrado_por_ini text
);
create index if not exists papelera_borrado_idx on public.papelera (borrado_at);
alter table public.papelera enable row level security;
create policy papelera_ver on public.papelera for select using (public.puede_cargar());
create policy papelera_cargar on public.papelera for insert with check (public.usuario_activo());
create policy papelera_sacar on public.papelera for delete using (public.puede_cargar());

-- Vacía lo que lleva más de 3 semanas. La app la llama al entrar; no hace falta pg_cron.
create or replace function public.purgar_papelera() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from public.papelera where borrado_at < now() - interval '21 days';
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.purgar_papelera() from public, anon;
grant execute on function public.purgar_papelera() to authenticated;
