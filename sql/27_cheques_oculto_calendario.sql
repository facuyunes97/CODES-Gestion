-- Ya aplicado en Supabase (migraciones 27 y 28). Solo documentación.
-- cheques.oculto_cal: el cheque/echeq pagado o cobrado se quitó a mano del Calendario (el cheque sigue registrado).
alter table cheques add column if not exists oculto_cal boolean not null default false;
-- trigger trg_cheque_oculto_cal (before update of oculto_cal, estado): al ocultarlo manda el evento de Google a calendario_borrados
-- (el script lo borra del calendario compartido) y deja en cheques_calendario una marca evento_id='oculto' para que "puente" no lo vuelva a crear;
-- si después cambia de estado (p. ej. «Deshacer»), vuelve a mostrarse.
