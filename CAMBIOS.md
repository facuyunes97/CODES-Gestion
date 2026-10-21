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
