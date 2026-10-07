-- Facturas recopiladas: si la factura ya está cargada en Facturas (mismo CUIT del emisor + tipo + punto de venta + número + total)
-- la recopilada se descarta sola (queda en "Descartadas", enlazada a la factura, con la nota correspondiente).
-- A) cuando llega/edita una recopilada y la factura ya existe.  B) cuando se carga una factura y ya había una recopilada igual.
create or replace function public.rc_auto_descartar() returns trigger language plpgsql security definer set search_path=public as $$
declare f uuid;
begin
  if new.estado = 'pendiente' and new.emisor_cuit is not null and new.punto_venta is not null and new.numero is not null and coalesce(new.total,0) > 0
     and (tg_op = 'INSERT' or (old.emisor_cuit, old.punto_venta, old.numero, old.tipo, old.total) is distinct from (new.emisor_cuit, new.punto_venta, new.numero, new.tipo, new.total)) then
    select fa.id into f from public.facturas fa join public.terceros te on te.id = fa.tercero_id
     where fa.lado::text = 'credito' and te.cuit = new.emisor_cuit and fa.punto_venta = new.punto_venta and fa.numero = new.numero
       and fa.tipo::text = new.tipo and abs(fa.total - new.total) <= 0.01 limit 1;
    if f is not null then
      new.estado := 'descartada'; new.factura_id := f; new.resuelta_at := now();
      new.observaciones := 'Ya estaba cargada en Facturas: se descartó sola.';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists rc_auto_descartar_t on public.facturas_recopiladas;
create trigger rc_auto_descartar_t before insert or update on public.facturas_recopiladas for each row execute function public.rc_auto_descartar();

create or replace function public.rc_auto_descartar_factura() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.lado::text = 'credito' and new.tercero_id is not null and coalesce(new.total,0) > 0 then
    update public.facturas_recopiladas r set estado = 'descartada', factura_id = new.id, resuelta_at = now(),
           observaciones = 'Ya estaba cargada en Facturas: se descartó sola.'
     where r.estado = 'pendiente' and r.emisor_cuit = (select cuit from public.terceros where id = new.tercero_id)
       and r.punto_venta = new.punto_venta and r.numero = new.numero and r.tipo = new.tipo::text and abs(r.total - new.total) <= 0.01;
  end if;
  return null;
end $$;
drop trigger if exists rc_auto_descartar_f on public.facturas;
create trigger rc_auto_descartar_f after insert on public.facturas for each row execute function public.rc_auto_descartar_factura();

-- barrido único de lo que ya estaba pendiente
update public.facturas_recopiladas r set estado = 'descartada', factura_id = fa.id, resuelta_at = now(), observaciones = 'Ya estaba cargada en Facturas: se descartó sola.'
  from public.facturas fa join public.terceros te on te.id = fa.tercero_id
 where r.estado = 'pendiente' and fa.lado::text = 'credito' and te.cuit = r.emisor_cuit and fa.punto_venta = r.punto_venta
   and fa.numero = r.numero and fa.tipo::text = r.tipo and abs(fa.total - r.total) <= 0.01 and coalesce(r.total,0) > 0;
