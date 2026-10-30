-- Codes 1.39: obra en la que está cada máquina hoy (vacío = depósito).
alter table public.centros_costo add column if not exists obra_actual_id uuid references public.centros_costo(id) on delete set null;
