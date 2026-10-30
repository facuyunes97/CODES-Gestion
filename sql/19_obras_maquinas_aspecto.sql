-- Codes 1.41: obra oculta del gráfico de Oficina; color y forma elegidos para cada máquina.
alter table public.centros_costo add column if not exists oculta_mapa boolean not null default false;
alter table public.centros_costo add column if not exists color_maquina text;
alter table public.centros_costo add column if not exists forma_maquina text;
