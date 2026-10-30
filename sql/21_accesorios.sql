-- Codes 1.51: accesorios de maquinaria (desmalezadora, rastra, tanque regador, casilla, tanque de combustible).
-- Se guardan como máquinas con forma_maquina = acc_*; los que se enganchan indican a qué tractor/camioneta van.
alter table public.centros_costo add column if not exists acoplado_a text;
