# CODES Gestión: estado para continuar (01/10/2026)

**Web:** https://codesconstrucciones.com.ar/ (también https://facuyunes97.github.io/CODES-Gestion/ redirige ahí). El archivo `CNAME` del repo fija el dominio.
**Repo:** github.com/facuyunes97/CODES-Gestion (rama main). `index.html` tiene todo el programa en una sola página.
**Supabase:** proyecto `codes-gestion` (ref `ljnhikarhvwgbktkkzug`, sa-east-1). No tocar el proyecto `codes-construcciones`: es del sistema anterior y tiene datos reales.

## Hecho
- Pantallas: transacciones (ingreso/egreso/interno), formas de pago con reglas por cuenta, impuesto D/C 0,6 % automático (exento entre bancos propios), retenciones manuales, cheques/Echeqs con almanaque, facturas por mes, posición de IVA con arrastre, centros de costo con contrato y saldo pendiente, resúmenes, resumen por cuenta (solo lectura), auditoría, Excel, logo y colores de CODES, versión para celular.
- Base Supabase: tablas, validaciones, auditoría, RLS (copia en `sql/`).
- Usuarios reales con Supabase Auth: alta propia, confirmación por email y aprobación del dueño.
- Roles: **dueño** (solo Facundo, FY; único que modifica, anula o elimina) y **contador** (ve y carga, no modifica ni borra).
- URL Configuration de Supabase cargada para github.io.

## Hecho el 05/10/2026
- Dominio propio activo (CNAME en el repo, Site URL y Redirect URL de Supabase cargadas).
- Selección múltiple con Modificar / Eliminar solo para el dueño, con cartel de confirmación (transacciones, cheques, facturas, centros, clientes y proveedores). Todo sigue en memoria: se pierde al recargar.
- Pantalla Clientes y proveedores; alta de cliente/proveedor al vuelo en Nueva transacción; tipos de centro de costo creables; cliente nuevo desde el alta de centro.
- Reglas al borrar: cheque en una transacción, factura con pagos, centro con movimientos y tercero en uso no se eliminan.
- Total de una transacción editable solo si tiene un único pago sin cheque y hasta una factura; al cambiarlo se recalcula el impuesto D/C.

## Pendiente
1. **Lo principal:** que las pantallas guarden y lean de Supabase. Hoy usan datos de ejemplo en memoria y se pierden al recargar. Orden propuesto: centros de costo y terceros, transacciones con pagos e impuesto D/C, saldos; después cheques, facturas e IVA.
2. Dominio codesconstrucciones.com.ar: listo.
3. Cargar datos reales: clientes, proveedores, obras y saldos iniciales.
