# Historial de versiones

## Codes 0.1 (15-oct-2026)
Versión base con todo lo hecho hasta ahora: facturas, recopiladas de Gmail, subida de facturas en PDF con lector, alerta de factura repetida, calendario enlazado con Google, estación de servicio y usuario en combustible/aceite, proveedores ordenados con buscador.

## Codes 0.2 (15-oct-2026)
- Subir facturas (PDF): si la factura ya estaba en recopiladas como pendiente o descartada, se vuelve a leer y queda pendiente de nuevo (antes decía "ya estaba… descartada" y no dejaba subirla).
- Factura repetida: la alerta al cargar compara número de comprobante + monto + fecha de emisión (y el proveedor) y avisa que puede ser la misma factura cargada dos veces; se puede descartar o seguir.
- Facturas: dueño y contador pueden seleccionar, modificar y eliminar facturas ya cargadas.
- Lector de facturas más preciso (ver 0.1 → importes verificados, dólares, etc.).

## Codes 0.3 (15-oct-2026)
- IVA por alícuota: 0 % · 10,5 % · 21 % · 27 % · Otros (se carga a mano). El lector detecta la alícuota de la factura y calcula IVA = neto × alícuota; lo que sobre hasta el total (percepciones, no gravado) va a "otros". Si no puede determinar una única alícuota, deja el IVA de la factura y avisa.
- Editar una recopilada y cargar una factura a mano usan el mismo selector de alícuota (IVA calculado, o editable si se elige "Otros").
- Corregido: en el formulario manual, la alícuota 10,5 % se calculaba como 105 %.

## Codes 0.4 (15-oct-2026)
- Un CUIT no se repite entre clientes/proveedores: al cargar una factura (recopilada, manual o desde una transacción) si el CUIT ya existe se usa ese proveedor automáticamente en vez de crear otro o dar error. Si era solo cliente (o solo proveedor) pasa a "cliente y proveedor".
- En "proveedor nuevo", al escribir un CUIT que ya existe se elige solo el proveedor existente. La base de datos ya impedía CUIT duplicados.

## Codes 0.5 (15-oct-2026)
- Calendario: cada recordatorio creado en la app muestra "Enlazando con Google…" hasta que el script de Google lo copia, y después "En Google".
- Script de Google (Apps Script): el calendario se sincroniza cada 1 minuto (antes 5 o 10). Hay que pegar el script nuevo y ejecutar "instalar" una vez.

## Codes 0.6 (17-oct-2026)
- Combustible y aceite: cada tabla de obra termina con una fila de totales (litros y total en $), y al final hay un total general de todas las obras.
- Avisos de Telegram por cada movimiento de calendario, cheques y combustible (ver cambios del 15-oct en el script de Google).

## Codes 0.7 (17-oct-2026)
- Nueva pantalla **Avance de obra** (Ingeniería / Obras): cada obra se divide en ítems con su incidencia en % (tienen que sumar 100 %; el sistema avisa si no suman y no deja pasarse).
- Cada ítem puede tener un subcontratista asignado (uno por ítem). Su avance sale solo de la última certificación cargada a ese subcontratista (avance acumulado); desde la fila se abre "Cargar avance del subcontrato".
- Los ítems de trabajo propio (sin subcontratista) tienen el avance a mano en la misma fila.
- Avance total de la obra = suma de incidencia × avance de cada ítem. Se puede descargar en Excel.
- Carga y modificación: dueño e ingeniero. Contador y lector solo ven. Obra finalizada: queda fija.
- Base de datos: tabla `obra_items` (con permisos, auditoría, tiempo real y bloqueo de obra finalizada).

## Codes 0.8 (17-oct-2026)
- Obras finalizadas: ya no aparecen como centro de costo en las listas y selectores (inicio, filtros y formularios de transacciones, resumen, Contratistas, Certificación, Resumen de gasto, Avance de obra). Quedan solo en Centro de costos (Administración) y en Centro de costos (obras) de Ingeniería, donde el dueño puede reabrirlas. Los resultados históricos del Resumen operativo siguen incluyéndolas.
- Avance de obra: cada obra en curso se muestra como una tarjeta con su % de avance y, arriba, una solapa que abre el detalle: ítems con su incidencia, subcontratistas y la lista de certificaciones de cada uno con cuánto suma cada una al avance de la obra. Aviso si hay subcontratistas sin ítem asignado.

## Codes 0.9 (17-oct-2026)
- Avance de obra: en el bloque de cada subcontratista (dentro de la solapa de la obra) el dueño y el ingeniero anotan directamente su incidencia en % en la obra. No hace falta crear un ítem aparte: el sistema lo crea solo. Valida que no pase de 100 % entre todos. Con la incidencia cargada, cada certificación del subcontratista suma al avance de la obra.

## Codes 1.0 (17-oct-2026)
- Obras finalizadas: nuevo botón **Eliminar registro** (solo el dueño) en Centros de costo y en Centro de costos (obras). Saca la obra de esas listas pero **no borra ningún movimiento**: ingresos, egresos, facturas, contratistas, certificaciones y combustible quedan, y los movimientos se siguen viendo en Administración y en el Resumen para el cierre de ejercicio.
- Al final de Centros de costo, "Obras eliminadas" permite al dueño volver a mostrarlas.
- Base de datos: tabla `centros_archivados` (solo el dueño agrega o quita; con auditoría y tiempo real).

## Nota 1.0 (DB)
- El dueño puede eliminar movimientos (transacciones, con sus pagos, retenciones y facturas vinculadas) de una obra finalizada que fue "eliminada" de Centros de costo. Cualquier otro cambio sobre una obra finalizada sigue bloqueado. Migración `dueno_borra_asientos_de_obra_archivada` (función `obra_bloquea`).

## 1.1
- Al elegir Transferencia, la cuenta por defecto (Sale de / Entra a) es Banco Patagonia; se puede cambiar.

## 1.2
- Nuevo ítem **Control Sueldos** en Administración (dueño y contadores; lector, ingeniero y operario no lo ven), con tres solapas:
  - **Legajo de empleados**: datos personales, laborales (convenio, categoría, zona, obra), obra social, ART, banco/CBU, talles, baja y reactivación. Valida DNI, CUIL y legajo único.
  - **Emisión de recibos**: liquidación por convenio con la escala vigente en el período (jornal por hora o sueldo mensual, horas extra, asistencia, antigüedad, no remunerativos, adelantos), aportes del trabajador, contribuciones del empleador, fondo de cese (UOCRA) y costo laboral total con gráfico. Recibo imprimible / PDF con las 4 secciones del Decreto 407/2026. Se guarda tal como se emitió.
  - **Convenios**: UOCRA 76/75 y UECARA 660/13 con escalas por vigencia (historial), parámetros y alícuotas editables, "Nueva escala" copiando con % de aumento, "Buscar actualización" (fuentes + marcar revisado) y datos del empleador.
- Base: tablas `sueldos_empresa`, `sueldos_convenios`, `sueldos_escalas`, `sueldos_empleados`, `sueldos_recibos` (solo dueño/contador; eliminar legajos y recibos solo el dueño). Escalas UOCRA sept–nov 2026 y UECARA oct 2026 cargadas.

## 1.3
- Cargas de combustible y aceite: solo el dueño ve el botón Eliminar. Cargar sigue igual. (Falta el bloqueo equivalente en la base de datos: pendiente de confirmación.)

## 1.4
- Combustible y aceite funcionan como el resto de las listas (Transacciones, Cheques, etc.): casillero en cada fila y para seleccionar todas, y barra con **Modificar** y **Eliminar** (solo el dueño). Se puede modificar máquina, obra, tipo, fecha y hora, litros y estación; antes de guardar se ve un resumen y queda en Auditoría. El precio por litro queda el de la carga.

## 1.5
- Convenios: UOCRA y UECARA en solapas separadas, y botones y valores de la escala bien acomodados (el valor ya no se pisa con Eliminar).

## 1.6
- Control Sueldos › Emisión de recibos: **importar la planilla de horas** (Excel .xlsx, PDF de texto o CSV, sin IA). Se leen las columnas por sus títulos (horas, feriados, extras 50 %, incremento solidario, SAC, presentismo, seguro, ATP, neto), se vinculan con los legajos (o se crean los que faltan), se calcula cada recibo con el convenio y se compara con el neto de la planilla. Se tildan los que se aceptan, se emiten y se guardan todos juntos en un PDF. Opción de usar el valor hora de la planilla.
- Recibos: feriados, incremento solidario, SAC, seguro y ATP.

## 1.7
- Cheques y Echeqs: los cheques cuya fecha de pago ya pasó muestran "Venció · confirmar" con botones **Ya se pagó / Ya se cobró** o **Rechazado**. Los pagados o cobrados se ven en amarillo en el listado y en los calendarios (Cheques y Calendario). Solo el dueño puede deshacer.

## 1.8
- Facturas recopiladas: se corrigió que las facturas subidas a mano tomaran el proveedor de la anterior (Track Mar SACI). Ahora, si el CUIT leído es de un proveedor del sistema, se completan solos proveedor y razón social; al editar, si se cambia el CUIT o el proveedor, el otro dato se completa y todo se puede corregir a mano.

## 1.9
- Posición de IVA: botón **Ver** en cada factura del detalle mensual. Abre una ventana con los datos y el PDF original (si la factura entró por Facturas recopiladas o por la subida de PDF). Las cargadas a mano muestran los datos y avisan que no tienen PDF.

## 1.10
- Subir facturas (PDF): ahora acepta también las **emitidas por CODES**. El sistema mira quién emite: si el emisor es CODES (su CUIT) la factura va a Facturas como **emitida** (genera débito fiscal) y la contraparte es el cliente; si emite otro, va como **recibida** (genera crédito fiscal). Se puede corregir a mano en Editar ("Qué es esta factura"). El puente de Gmail sigue ignorando las emitidas.
- Base: columna `lado` en facturas_recopiladas (sql/11) y función leer_factura actualizada.

## Codes 1.11 (26-oct-2026)
- Facturas emitidas por CODES: el lector ahora sigue la estructura real del comprobante ARCA. Emisor = CODES (arriba a la izquierda, se confirma con el CUIT); cliente = bloque del medio (CUIT, razón social, domicilio). Antes tomaba como cliente el texto de las etiquetas ("Domicilio Comercial: 05/10/2026…").
- Facturas B emitidas: usa el "IVA Contenido" que informa ARCA como débito fiscal (antes quedaba IVA 0 o total 0).
- La fecha de emisión se toma del bloque de fechas del comprobante.
- Corregidas las 7 facturas emitidas ya subidas (cliente, fecha, neto/IVA/total, lado débito).

## Codes 1.12 (26-oct-2026)
- Facturas recopiladas: la app no leía la columna "lado" y mostraba las emitidas por CODES como recibidas (crédito fiscal). Ahora las emitidas se ven y se cargan como emitidas (débito fiscal), con el cliente en lugar del proveedor.

## Codes 1.13 (26-oct-2026)
- **Papelera**: todo lo que se borra (facturas, cheques, transacciones, clientes/proveedores, centros de costo, contratistas, sueldos, combustible, etc.) ahora se guarda en la Papelera (menú Administración) en vez de perderse. Cada elemento muestra qué era, quién y cuándo lo borró y cuántos días le quedan. Botón **Restaurar** lo devuelve a donde estaba. A las 3 semanas se elimina solo.
- Base: tabla `papelera` y función `purgar_papelera` (sql/12). Visible para dueño y contador.

## Codes 1.14 (26-oct-2026)
- Resumen → "Por centro de costo": ahora muestra solo los centros activos. Los finalizados o desactivados aparecen abajo en otro cuadro, "Centros finalizados o inactivos".

## Codes 1.15 (26-oct-2026)
- Transacciones → totales del registro: ya no mezclan pesos con dólares. Si en lo que se ve hay operaciones en dólares, los totales (ingresos, egresos, resultado, internos) se muestran en dos bloques: en pesos y en dólares (US$). También en el Excel exportado.

## Codes 1.16 (28-oct-2026)
- **Importar Excel de ARCA** (Facturas y Facturas recopiladas): se sube el Excel "Mis Comprobantes Recibidos" y cada comprobante nuevo queda como **Pendiente** en Facturas recopiladas para aceptarlo (Cargar) o rechazarlo (Descartar). Lee facturas A/B/C/M y notas de crédito/débito; los recibos no se usan; los de dólares se pasan a pesos con el tipo de cambio de ARCA.
- Repetidas: se compara CUIT del emisor + punto de venta + número (mismo tipo o mismo importe) contra Facturas cargadas, Facturas recopiladas (cualquier estado) y dentro del mismo Excel. Si la factura cargada no tiene CUIT, compara punto de venta + número + importe. Al terminar muestra cuántas son nuevas, cuáles ya estaban y por qué.
- Base: permiso para insertar en facturas_recopiladas (sql/13).
