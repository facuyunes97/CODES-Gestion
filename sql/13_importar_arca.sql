-- Importa el Excel/CSV "Mis Comprobantes Recibidos" de ARCA a Facturas recopiladas (queda pendiente: se autoriza o se descarta a mano).
-- Una fila se considera repetida si ya existe (en Facturas o en Facturas recopiladas, en cualquier estado) el mismo
-- CUIT del emisor + punto de venta + número + tipo y el mismo importe. Si coincide todo menos el importe, se importa igual con un aviso.
create or replace function public.importar_arca(p_filas jsonb, p_archivo text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  f jsonb; v_cuit text; v_tipo text; v_pv int; v_nro bigint; v_tot numeric; v_tn text;
  nuevas int := 0; rep jsonb := '[]'::jsonb; avisos jsonb := '[]'::jsonb;
  v_eq record; v_obs text; v_nom text; v_dif boolean;
begin
  if not public.puede_cargar() then raise exception 'SIN_PERMISO'; end if;
  for f in select * from jsonb_array_elements(p_filas) loop
    v_cuit := regexp_replace(coalesce(f->>'cuit',''),'\D','','g');
    v_tipo := f->>'tipo'; v_pv := (f->>'pv')::int; v_nro := (f->>'nro')::bigint; v_tot := (f->>'total')::numeric;
    v_tn := case when v_tipo='M' then 'A' else v_tipo end;
    v_nom := v_tipo||' '||lpad(v_pv::text,4,'0')||'-'||lpad(v_nro::text,8,'0')||' · '||coalesce(f->>'razon','');
    v_dif := false;
    -- 1) ya cargada en Facturas
    select fa.total into v_eq from public.facturas fa join public.terceros te on te.id=fa.tercero_id
      where fa.lado='credito' and regexp_replace(coalesce(te.cuit,''),'\D','','g')=v_cuit and fa.punto_venta=v_pv and fa.numero=v_nro
        and (case when fa.tipo::text='M' then 'A' else fa.tipo::text end)=v_tn and abs(fa.total-v_tot)<=0.01 limit 1;
    if found then rep := rep||jsonb_build_object('n',v_nom,'m','ya está cargada en Facturas'); continue; end if;
    -- 2) ya está en Facturas recopiladas (pendiente, cargada o descartada)
    select r.estado, r.total into v_eq from public.facturas_recopiladas r
      where r.lado='credito' and regexp_replace(coalesce(r.emisor_cuit,''),'\D','','g')=v_cuit and r.punto_venta=v_pv and r.numero=v_nro
        and (case when r.tipo='M' then 'A' else r.tipo end)=v_tn and abs(r.total-v_tot)<=0.01 limit 1;
    if found then rep := rep||jsonb_build_object('n',v_nom,'m','ya estaba en Facturas recopiladas ('||v_eq.estado||')'); continue; end if;
    -- 3) mismo comprobante pero con otro importe: se importa igual y se avisa
    perform 1 from public.facturas fa join public.terceros te on te.id=fa.tercero_id
      where fa.lado='credito' and regexp_replace(coalesce(te.cuit,''),'\D','','g')=v_cuit and fa.punto_venta=v_pv and fa.numero=v_nro
        and (case when fa.tipo::text='M' then 'A' else fa.tipo::text end)=v_tn;
    if found then v_dif := true; end if;
    if not v_dif then
      perform 1 from public.facturas_recopiladas r
        where r.lado='credito' and regexp_replace(coalesce(r.emisor_cuit,''),'\D','','g')=v_cuit and r.punto_venta=v_pv and r.numero=v_nro
          and (case when r.tipo='M' then 'A' else r.tipo end)=v_tn;
      if found then v_dif := true; end if;
    end if;
    v_obs := coalesce(f->>'obs','');
    if v_dif then
      v_obs := trim('ATENCIÓN: ya existe una factura con el mismo CUIT, punto de venta y número pero con OTRO IMPORTE. Revisar si es la misma. '||v_obs);
      avisos := avisos||jsonb_build_object('n',v_nom,'m','mismo número que otra factura pero distinto importe');
    end if;
    insert into public.facturas_recopiladas(gmail_message_id,adjunto,recibida_at,remitente,asunto,lado,emisor_cuit,emisor_razon,receptor_cuit,
        tipo,punto_venta,numero,fecha,neto_gravado,iva,otros,total,cae,observaciones)
      values('arca-'||v_cuit||'-'||v_tipo||'-'||v_pv||'-'||v_nro||case when v_dif then '-'||substr(md5(v_tot::text),1,6) else '' end,
        p_archivo, now(),'Subida a mano','Excel ARCA · '||p_archivo,'credito',f->>'cuit_fmt',nullif(f->>'razon',''),'30-71700245-4',
        v_tipo,v_pv,v_nro,nullif(f->>'fecha','')::date,(f->>'neto')::numeric,(f->>'iva')::numeric,(f->>'otros')::numeric,v_tot,nullif(f->>'cae',''),nullif(v_obs,''))
      on conflict (gmail_message_id, adjunto) do nothing;
    if found then nuevas := nuevas+1; else rep := rep||jsonb_build_object('n',v_nom,'m','ya estaba en Facturas recopiladas'); end if;
  end loop;
  return jsonb_build_object('nuevas',nuevas,'repetidas',rep,'avisos',avisos);
end $$;
revoke all on function public.importar_arca(jsonb,text) from public, anon;
grant execute on function public.importar_arca(jsonb,text) to authenticated;
