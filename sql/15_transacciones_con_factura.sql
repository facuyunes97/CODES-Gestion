-- Codes 1.27: cada transacción (ingreso o egreso) se marca como con factura o sin factura (en negro).
-- con_factura: true = con factura, false = sin factura, null = sin definir (las existentes quedan así hasta que se marquen).
alter table public.transacciones add column if not exists con_factura boolean;
-- guardar_transaccion ahora guarda y actualiza con_factura (ver la función en la base).
