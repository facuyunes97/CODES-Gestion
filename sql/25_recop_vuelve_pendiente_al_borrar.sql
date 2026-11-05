-- Al borrar una factura, las recopiladas que figuraban "cargada" con esa factura vuelven a "pendiente".
create or replace function rc_factura_borrada() returns trigger language plpgsql security definer set search_path=public as $$
begin
  update facturas_recopiladas set estado='pendiente', factura_id=null, resuelta_at=null, resuelta_por=null
   where factura_id=old.id and estado='cargada';
  return old;
end $$;
drop trigger if exists rc_factura_borrada_t on facturas;
create trigger rc_factura_borrada_t after delete on facturas for each row execute function rc_factura_borrada();
