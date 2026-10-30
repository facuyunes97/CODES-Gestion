-- Codes 1.46: alta rápida de obra desde la Oficina (solo nombre).
-- El dueño puede crear una obra sin cliente ni contrato; se completa después en Centro de costos (obras).
-- Al contador y a otros roles se les sigue exigiendo cliente y contrato; al dueño, también cuando una obra ya completa pasaría a quedar incompleta.
create or replace function public.validar_centro_costo()
 returns trigger
 language plpgsql
 set search_path to 'public'
as $function$ declare v_obra boolean; v_ing boolean; v_dueno boolean; v_incompleto boolean; v_antes_incompleto boolean;
begin
  v_ing := coalesce(public.rol_actual() = 'ingeniero', false);
  v_dueno := coalesce(public.rol_actual() = 'dueno', false);
  if new.tipo_id is null then new.tipo_id := new.tipo::text; end if;
  select lleva_contrato into v_obra from tipos_centro where id = new.tipo_id;
  if v_obra is null then raise exception 'Tipo de centro inexistente'; end if;
  v_incompleto := new.cliente_id is null or coalesce(new.valor_contrato,0) <= 0;
  if v_ing then
    if tg_op = 'INSERT' then new.valor_contrato := null; else new.valor_contrato := old.valor_contrato; new.cliente_id := old.cliente_id; end if;
  elsif v_obra and v_incompleto then
    v_antes_incompleto := tg_op = 'UPDATE' and (old.cliente_id is null or coalesce(old.valor_contrato,0) <= 0);
    if not (v_dueno and (tg_op = 'INSERT' or v_antes_incompleto)) then
      raise exception 'Este tipo de centro lleva cliente y valor de contrato';
    end if;
  end if;
  new.tipo := case when new.tipo_id in ('obra','maquina','administracion','otro') then new.tipo_id::tipo_centro_costo else 'otro'::tipo_centro_costo end;
  return new;
end $function$;
