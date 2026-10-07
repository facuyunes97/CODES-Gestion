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

## Guardado en tiempo real (hecho)
- Con la página publicada (https) el programa entra por inicio de sesión (la sesión dura mientras la pestaña esté abierta) y **todo lo que se hace se guarda al instante en Supabase**: transacciones con pagos, retenciones e imputaciones, impuesto D/C, cheques (y sus estados), facturas, centros, tipos de centro, clientes/proveedores, alícuota y cuentas que pagan el impuesto.
- Cómo funciona: `index.html` compara lo que hay en pantalla con lo último guardado y manda solo la diferencia (bloque "Guardado en Supabase"). Si la base rechaza algo, avisa el motivo y vuelve a lo guardado. Otros usuarios se ven solos (Realtime) y el botón verde "Guardado" actualiza a mano.
- Abierto como archivo (file://) sigue el modo demo con datos de ejemplo.
- `sql/04_guardado_tiempo_real.sql`: tipos_centro, centros_costo.tipo_id, tercero ARCA, función guardar_transaccion, Realtime. Ya aplicado en `codes-gestion`.
- Auditoría ordenada por año y mes (chips; "Todo el año" agrupa por mes); en la base se carga solo el período elegido y el Excel exporta ese período. Nunca se borra.
- Celular: las tablas pasan a tarjetas (menos de 700 px).
- Límites: modificar una transacción borra y vuelve a cargar sus líneas en dos pasos (si falla el segundo se restaura la versión anterior); la auditoría muestra las últimas 1.000 acciones.

## Usuarios y roles (hecho)
- Tres roles: Dueño (todo), Contador (carga y consulta) y Lector (solo mira). La pantalla Usuarios los explica, permite cambiar el rol, habilitar, desactivar y eliminar. Un usuario con movimientos no se elimina (se desactiva). El rol Lector está bloqueado también en la base (`sql/05_rol_lector_y_usuarios.sql`).

## Ingeniería / Obras (hecho)
- Menú: sección «Administración» (plegable, la ven Dueño, Contador y Lector) y sección «Ingeniería / Obras» (la leen todos; el estado plegado se recuerda en el navegador).
- Roles nuevos: **Ingeniero** (maneja toda Ingeniería/Obras, no ve Administración, ve clientes y valor de contrato) y **Operario** (solo Maquinaria y Combustible: carga combustible y arreglos con botones grandes; no ve costos). Contador y Lector leen Ingeniería sin modificar; solo Dueño e Ingeniero modifican y eliminan allí. `puedeCargar()` ahora es solo Dueño y Contador.
- Pantallas: Centro de costos (obras = centros tipo obra), Contratistas (obra, trabajo, días estimados, monto), Certificación (avance acumulado % o monto; calcula el otro; no deja pasar del monto del contratista), Maquinaria (máquinas = centros tipo maquina con marca/modelo/año/patente/notas, más arreglos), Combustible (cada carga suma a la máquina). Todo con Excel (salvo Operario) y registrado en Auditoría.
- Base: `sql/07_ingenieria_obras.sql` (ya aplicado). Tablas contratistas, certificaciones, combustible_cargas, maquinaria_arreglos; políticas restrictivas para que Ingeniero/Operario no lean las tablas de Administración.
- Ajustes del 6-oct (tarde): el Ingeniero no ve el valor de contrato (la pantalla lo oculta y la base conserva el valor si él edita; las obras que crea quedan sin contrato hasta que Dueño/Contador lo completan). Ojo: oculto en la pantalla, no a nivel de base de datos. Nuevo ítem «Resumen» (combustible por obra y por máquina, arreglos, filtro por período) y «Arreglo de maquinaria» (Maquinaria queda solo con datos). Combustible: tipo (nafta, diésel 500, diésel premium), obra y precio por litro (lo configuran Dueño y Contador; cada carga guarda el precio vigente, fijado por el servidor), con resumen arriba. Anticipos de obra en Certificación: se descuentan en el monto que se elija al certificar.
- Contratistas = proveedores: cada contratista tiene su proveedor (lo crea o enlaza por CUIT el servidor; Dueño/Contador pueden asociar uno existente). En Egreso el proveedor aparece como «Nombre · Contratista (OB..)» y sugiere la obra; Contratistas muestra Pagado y Saldo a pagar (certificado − pagado) y «Ver pagos» (el Ingeniero ve solo el total, vía función `pagos_contratistas`). Las máquinas ya no figuran en el Centro de costo de las transacciones.
- Límites: combustible, certificaciones y arreglos no se editan (se eliminan y se vuelven a cargar); el Ingeniero puede editar obras y máquinas pero no eliminar ni desactivar centros (eso es del Dueño).

## Pendiente
1. Cargar datos reales: clientes, proveedores, obras, cheques y saldos iniciales (lo que se escribió en la versión de ejemplo no quedó guardado en ningún lado).
2. Probar con usuarios reales (dueño y contador) desde el celular y ajustar lo que moleste.
3. Opcional: totales al pie en Facturas, Cheques y Centros.

## Existencia inicial
- Transacciones → botón «+ Existencia inicial»: una pantalla con una fila por caja/banco/billetera. Crea una transacción tipo `inicial` por moneda (sin tercero, sin impuesto D/C, no cuenta como ingreso en el Resumen; en el Resumen entra como saldo inicial de la cuenta).
- Una existencia por cuenta y por año: si ya hay una activa, avisa. Para corregirla se usa Modificar/Anular en Transacciones.

## v3 (6-oct 20:00)
- Menú: grupo **Administración**, grupo **Ingeniería / Obras** (obras, contratistas, certificación, resumen de gasto), grupo **Operario** (maquinaria, arreglos, combustible; único que ve el operario) y **Resumen operativo** suelto abajo (solo administración).
- Certificación agrupada por obra → contratista; cada avance admite adjuntos (foto/PDF ≤10 MB) en el bucket privado `adjuntos-obra` (metadatos en `certificaciones.adjuntos`).
- Nueva vista `gasto` (Resumen de gasto): presupuesto, certificado, cobrado, avance, falta certificar y falta cobrar por contratista y obra.

## v4 (7-oct 12:00)
- Calendario propio para los campos de fecha (escritorio): mes y año grandes, días de otros meses atenuados, botón Hoy. En celular se usa el nativo.
- Movimiento interno muestra los saldos de bancos y cajas, y cómo quedan con el movimiento.
- Resumen: "Resultado por centro de costo" sin máquinas. Centros de costo agrupados por tipo y plegables. Tabla de obras con la columna Obra ancha.
- Combustible agrupado por obra, con filtro por máquina y por fecha (desde/hasta).
- Backup semanal automático (pg_cron, domingos 3:00 Argentina) con cartel en la app; el dueño puede hacer uno manual y descargarlos desde Usuarios → Copias de seguridad. No hay borrado automático de backups viejos (la app muestra los últimos 10).

## v5 (7-oct 13:00)
- Al cargar una factura con fecha de un mes anterior, el formulario avisa y obliga a elegir el mes de IVA: mes de la factura o mes siguiente (y "este mes" si pasó más de un mes). Se guarda en `facturas.periodo_iva`. La posición de IVA y la lista de Facturas agrupan por ese mes; en Modificar facturas hay una columna "Imputa a (IVA)".

## v6 · Facturas recopiladas y calendario de cheques (7-oct)
- App: menú Administración → **Facturas recopiladas** (selección, Ver PDF/mail, Revisar, Cargar al sistema con elección de mes de IVA para facturas viejas, Descartar). Carga usa `crearFactura` (crea proveedor por CUIT si falta, evita duplicados).
- Carpeta `puente/`: parser, Edge Function y script de Google. **Pendiente de instalar** (ver `puente/LEEME.md`): desplegar función, crear clave, pegar script en codessrl.sgo@gmail.com.
- WhatsApp: sin hacer; a definir (Telegram / WhatsApp Business API).

- (7-oct 19:00) Facturas recopiladas: aviso "Proveedor cargado / no cargado" por CUIT con selector de proveedor (completa CUIT y aprende el mail), botones Cargar · Editar · Descartar, editor con todos los campos (proveedor, razón, CUIT, tipo, PV, nro, fecha, neto, IVA, otros, total, CUIT receptor) y miniatura del PDF.
- (7-oct 20:00) Auto-descarte: triggers rc_auto_descartar_t / rc_auto_descartar_f (sql/09): recopilada con mismo CUIT+tipo+PV+nro+total que una factura cargada pasa sola a Descartadas con nota. Mismo nro con otro importe queda pendiente con aviso.
