-- Existencia inicial: saldo con el que arranca cada ejercicio en cajas y bancos.
-- Tipo de transacción 'inicial': sin tercero, solo cuenta destino, sin impuesto D/C.
alter type tipo_transaccion add value if not exists 'inicial';
-- (en la base real se aplicó en dos migraciones: el enum primero, lo demás después)
alter table transacciones drop constraint chk_tercero_segun_tipo;
alter table transacciones add constraint chk_tercero_segun_tipo check (
  (tipo in ('entrada','salida') and tercero_id is not null)
  or (tipo in ('interna','inicial') and tercero_id is null));
-- validar_linea_pago(): rama nueva al principio para 'inicial' (solo cuenta destino: caja, banco o billetera).
-- El resto de la función no cambia.
