-- Codes 1.58: al descartar una factura recopilada se borra (antes quedaba como "Descartada").
create policy recop_borra on public.facturas_recopiladas for delete using (puede_cargar());
-- Se limpiaron las facturas del Excel de ARCA que los contadores ya habían descartado a mano.
delete from public.facturas_recopiladas where formato = 'arca' and estado = 'descartada' and resuelta_por is not null;
