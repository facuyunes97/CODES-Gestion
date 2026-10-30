-- Codes 1.32: dueño y contador pueden asociar facturas a una transacción ya hecha (solo toca transaccion_facturas y con_factura).
create or replace function public.asociar_facturas(p jsonb)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v_id uuid := (p->>'id')::uuid; t record; x jsonb; f record; v_tot numeric := 0; v_imp numeric; v_otros numeric; v_lado text;
begin
  if not puede_cargar() then raise exception 'Tu rol solo permite consultar'; end if;
  select * into t from transacciones where id = v_id;
  if not found then raise exception 'La transacción no existe'; end if;
  if t.estado <> 'activa' then raise exception 'La transacción está anulada'; end if;
  if t.auto_tipo is not null or t.tipo::text not in ('entrada','salida') then raise exception 'Esta transacción no lleva factura'; end if;
  v_lado := case when t.tipo::text = 'entrada' then 'debito' else 'credito' end;
  for x in select * from jsonb_array_elements(coalesce(p->'facts','[]')) loop
    v_imp := (x->>'importe')::numeric;
    if v_imp is null or v_imp <= 0 then raise exception 'El importe de cada factura tiene que ser mayor a cero'; end if;
    select * into f from facturas where id = (x->>'factura_id')::uuid;
    if not found then raise exception 'La factura no existe'; end if;
    if f.lado::text <> v_lado then raise exception 'La factura % no corresponde a este tipo de transacción', f.numero; end if;
    select coalesce(sum(tf.importe_imputado),0) into v_otros from transaccion_facturas tf join transacciones tt on tt.id = tf.transaccion_id
      where tf.factura_id = f.id and tt.estado = 'activa' and tt.id <> v_id;
    if f.total - v_otros < 1 then raise exception 'La factura % ya está cancelada por completo', f.numero; end if;
    if v_imp > f.total - v_otros + 0.005 then raise exception 'La factura % no alcanza: le quedan %', f.numero, round(f.total - v_otros, 2); end if;
    v_tot := v_tot + v_imp;
  end loop;
  if v_tot > t.total + 0.005 then raise exception 'Las facturas suman más que el total de la transacción'; end if;
  delete from transaccion_facturas where transaccion_id = v_id;
  insert into transaccion_facturas (transaccion_id, factura_id, importe_imputado)
    select v_id, (e->>'factura_id')::uuid, (e->>'importe')::numeric from jsonb_array_elements(coalesce(p->'facts','[]')) e;
  if v_tot > 0 then update transacciones set con_factura = true where id = v_id and con_factura is distinct from true; end if;
end $function$;
revoke all on function public.asociar_facturas(jsonb) from public, anon;
grant execute on function public.asociar_facturas(jsonb) to authenticated;
