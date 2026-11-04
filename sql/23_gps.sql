-- Integración con la plataforma GPS (RedGPS / Copsat): unidades y kilómetros/horas por día.
create table if not exists public.gps_unidades (
  imei text primary key,
  nombre text, patente text,
  cc_id uuid references public.centros_costo(id) on delete set null,
  odometro_km numeric, ultimo_reporte timestamptz, ignicion int,
  actualizado timestamptz default now()
);
create table if not exists public.gps_diario (
  imei text not null, fecha date not null,
  km numeric default 0, horas numeric default 0, odometro_km numeric,
  actualizado timestamptz default now(),
  primary key (imei, fecha)
);
alter table public.gps_unidades enable row level security;
alter table public.gps_diario enable row level security;
drop policy if exists gps_u_lee on public.gps_unidades;
create policy gps_u_lee on public.gps_unidades for select to authenticated using (true);
drop policy if exists gps_u_cc on public.gps_unidades;
create policy gps_u_cc on public.gps_unidades for update to authenticated using (es_dueno()) with check (es_dueno());
drop policy if exists gps_d_lee on public.gps_diario;
create policy gps_d_lee on public.gps_diario for select to authenticated using (true);
-- escribe solo la función (service role)
