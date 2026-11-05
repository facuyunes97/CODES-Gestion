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

-- 24: la plataforma (getOdometer, odometro_gps=0) devuelve en "km" lo recorrido DESPUÉS de esa fecha hasta hoy.
-- El recorrido del día es: valor del día anterior - valor del día. Validado contra coordenadas de history/get.
create or replace view public.gps_km_dia with (security_invoker = true) as
select imei, fecha, round((lag(km) over (partition by imei order by fecha) - km)::numeric, 2) as km_dia
from public.gps_diario;
