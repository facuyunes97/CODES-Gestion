-- Importar el Excel de ARCA (Mis Comprobantes Recibidos) desde la app: dueño y contador pueden insertar en recopiladas.
create policy recop_inserta on public.facturas_recopiladas for insert with check (public.puede_cargar());
