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

## Codes 1.17 (28-oct-2026)
- Facturas: nuevo dato **"Cómo está la factura"** con tres opciones: Física (papel), Digital (PDF / mail) o Solo en ARCA. Se elige al cargar una factura, al editarla (también en lote) y en Facturas recopiladas. Se ve como una etiqueta bajo el número de comprobante.
- Valores iniciales: lo que llega por mail o se sube en PDF queda como Digital; lo que viene del Excel de ARCA queda como Solo en ARCA; las facturas cargadas a mano quedan sin definir hasta que el contador lo complete. Al pasar de Recopiladas a Facturas el dato se conserva.

## Codes 1.18 (29-oct-2026)
- Nuevo ítem **Oficina** en Administración, debajo de Usuarios. Muestra en 3D un equipo de 9 agentes (Director Ejecutivo; Director Adm. con Compras, Pagos y Cobros; Director Marketing con Imagen, Guion y Redes) con su organigrama.
- Los cuatro puestos de Administración controlan los datos del sistema en vivo (solo lectura, sin consultas nuevas a la base): facturas de venta sin cobro, facturas borradas, cobrado contra facturado, pagos sin factura, proveedores concentrados, combustible (premium contra diésel 500, falta de km/horas), cheques vencidos y por vencer, saldos negativos, movimientos repetidos, fechas imposibles, obras de prueba y clientes duplicados.
- Se recalcula solo cada vez que cambia algo; cuando entra un movimiento nuevo, un informe viaja del agente a su jefe. Los informes que suben por la jerarquía son las alertas abiertas.
- Archivos: `oficina.js` (carga solo al abrir la pantalla; usa three.js desde cdnjs/jsDelivr). Si el navegador no puede abrir 3D, queda el organigrama.
- Marketing todavía no tiene datos (falta el usuario de Instagram).

## Codes 1.19 (29-oct-2026)
- Oficina: caja de charla con el Director Ejecutivo, debajo de la oficina. Solo para el dueño. Él responde con los hallazgos de los contadores de ese momento; solo recomienda, no carga ni paga nada. La charla se guarda en este navegador (botón «Borrar charla»).
- Nueva función de Supabase `director` (archivo `puente/director.ts`). Necesita el secreto `ANTHROPIC_API_KEY` en Supabase → Edge Functions → Secrets; sin él la caja avisa que falta la clave.

## Codes 1.19.1 (29-oct-2026)
- Oficina: la caja del Director Ejecutivo pasa justo debajo de la barra de agentes (antes estaba al final de la pantalla).

## Codes 1.20 (29-oct-2026)
- Oficina: Marketing ya trabaja con datos reales. Imagen, Guion y Redes muestran lo que se leyó del Instagram de CODES (@codesconstrucciones: 18 publicaciones, 94 seguidores) y lo que falta resolver. Se ven en movimiento y le informan al Director Ejecutivo, que ahora también lo conoce en la charla.
- Es una lectura hecha el 29-oct: no se actualiza sola.

## Codes 1.20.1 (29-oct-2026)
- Oficina: Marketing actualizado. Instagram limpio (publicaciones archivadas, logo nuevo), línea editorial «Cómo se hace» (70 % edificio, 20 % maquinaria, 10 % herramientas), plan de 4 semanas y comparación con 5 cuentas del rubro. El Director lo conoce en la charla.

## Codes 1.21 (29-oct-2026)
- Oficina: nuevo contador «Maquinaria», que responde a Dir. Adm. Junta las cargas de combustible de cada semana, las pasa a horas de motor según la ficha del fabricante (o un rango típico por tipo de máquina) y marca las cargas que no cierran: carga mayor que el tanque, o litros que no entran en las horas posibles entre dos cargas.
- Es una estimación (supone que cada carga llena el tanque) y un desvío es para revisar, no prueba nada. Para confirmarlo hacen falta marca y modelo de cada máquina y el horómetro en cada carga.
- Los hallazgos de combustible de Compras (kilometraje y ritmo diario) pasan a Maquinaria; Compras conserva la comparación de precios.

## Codes 1.22 (29-oct-2026)
- Oficina: nuevo contador «Impuestos», que responde a Dir. Adm. Suma las ventas del ejercicio (netas y brutas, con notas de crédito restadas), resta los gastos con factura y estima el resultado a hoy, el proyectado al 31/12 y el impuesto a las Ganancias con la escala de sociedades 2026. También informa IVA e impuesto a los créditos y débitos.
- Informe automático todos los viernes a las 13 h (hora de Argentina). El Director Adm. lo revisa con chequeos (facturas que no suman, fechas imposibles, datos de pocos meses, gastos sin factura). Si no hay problemas graves lo aprueba y el Director Ejecutivo deja un aviso en pantalla al dueño y a los contadores; si lo observa, el aviso va solo al dueño.
- Los avisos aparecen arriba de cualquier pantalla con «Ver en Oficina» y «Entendido». Nuevas tablas en la base: informes_impuestos, anuncios e impuestos_config (escala de Ganancias editable).
- Es una estimación: no incluye amortizaciones, sueldos y cargas, anticipos ni ajuste por inflación, y los pagos sin factura no se descuentan. La cifra final la valida el contador matriculado.
- El Director Ejecutivo conoce al contador Impuestos y puede responder sobre su informe.

## Codes 1.22.1 (29-oct-2026)
- Oficina: los contadores también pueden hablar con el Director Ejecutivo (antes solo el dueño). El Director sabe con quién habla y no lo trata como al dueño. Ven los mismos datos que ya ven en el sistema.

## Codes 1.22.2 (29-oct-2026)
- Oficina: identidad CODES. Logo grande con el rojo de marca detrás del Director Ejecutivo, franja roja y blanca de obra en el zócalo, borde rojo en la alfombra de Dirección y cinco láminas de maquinaria (excavadora, motoniveladora, cargadora frontal, rodillo compactador y camión hormigonero) sobre las paredes. Se mantiene el estilo blanco y gris.
- Impuestos: cuando los pagos sin factura superan el 25 % de las ventas pasa a «urgente» y su recuadro se ve en rojo (cuenta en las alertas del Ejecutivo).

## Codes 1.22.3 (29-oct-2026)
- Oficina: se saca el cuadro rojo «cosas urgentes» de arriba a la izquierda del 3D (el contador de urgentes sigue arriba) y el cartel del fondo ahora lleva el logo real de CODES Construcciones en vez de la «C».

## Codes 1.23 (30-oct-2026)
- Recibos de sueldo: nueva opción **Jornada** (completa o media jornada). En media jornada se liquida el 50 % del sueldo básico y de la antigüedad; el recibo lo indica. Para jornales por hora (UOCRA) no aplica: se cargan las horas trabajadas.
- UECARA: se cargó la escala de la **Zona I – Norte** (incluye Santiago del Estero) de octubre 2026 y queda como zona por defecto al elegir el convenio, al crear un legajo o al importar planillas. El legajo 010 pasó de Zona II – Centro a Zona I – Norte.

## Codes 1.24 (30-oct-2026)
- Recibos de sueldo: la impresión (y el PDF) sale en **una sola hoja A4 por recibo**. Se achicó la letra y los espacios, aportes y contribuciones van lado a lado, y se sacó el encabezado y pie del navegador (fecha y dirección web). Al imprimir varios recibos juntos, cada uno ocupa su propia hoja.

## Codes 1.25 (30-oct-2026)
- Oficina: el Director de Marketing pasa a llamarse **Michael** (Director de Marketing, productor y orquestador). Su ficha ahora cuenta qué hace, sus habilidades y lo que necesita de vos: escribe textos para Instagram con el recetario de marca de CODES, solo habla con Facundo y no tiene acceso a las cuentas.

## Codes 1.26 (30-oct-2026)
- Oficina: Michael ya tiene confirmado el Instagram de CODES (@codesconstrucciones); se saca ese pendiente de su ficha.

## Codes 1.27 (30-oct-2026)
- Transacciones: nuevo dato **«¿Tiene factura?»** con dos opciones: Con factura o Sin factura (en negro). Es obligatorio al cargar un ingreso o un egreso nuevo. Los traspasos internos no lo llevan.
- Las transacciones que ya existían quedan en «Sin definir» hasta que se marquen: se puede hacer desde Modificar (también de a varias a la vez, con la columna nueva). Solo el dueño puede modificar transacciones.
- En la lista de Transacciones hay un filtro nuevo «Factura» (Todas, Con factura, Sin factura, Sin definir) y cada fila y cada detalle muestran la marca.
- Oficina: Compras ya no reclama factura de lo que se marcó sin factura a propósito; muestra aparte cuánto se pagó en negro y avisa cuántos pagos y cobros todavía no se definieron. Cobros e Impuestos muestran lo mismo de su lado.

## Codes 1.28 (30-oct-2026)
- Transacciones: en el detalle de una transacción ya cargada hay un botón nuevo **«Asociar a una factura o crear una»** (o **«Cambiar facturas asociadas»** si ya tenía). Permite tildar facturas existentes del mismo cliente o proveedor, con el importe que corresponde a este pago, o **crear una factura nueva** ahí mismo para ese pago. Solo el dueño puede hacerlo, como el resto de las modificaciones de transacciones.
- Al asociar una factura, la transacción pasa sola a «Con factura». Queda anotado en Auditoría qué facturas tenía antes y cuáles tiene ahora.
- Se controla que las facturas no sumen más que el total de la transacción y que cada una tenga saldo suficiente.
- Arreglo: el filtro «Factura» de Transacciones usaba el mismo nombre interno que el de la pantalla Facturas y podía dejar la lista vacía. Ya están separados.

## Codes 1.29 (30-oct-2026)
- Transacciones: en la columna Factura, lo que va sin factura ahora dice «Sin fact.» con la misma letra que el número de una factura cargada (antes era una etiqueta de color).

## Codes 1.30 (30-oct-2026)
- Nuevo anuncio automático **«Ver posiciones de IVA»**: les aparece al dueño y a los contadores desde el día 20 de cada mes, con un botón «Ir a IVA» que los lleva a la Posición de IVA. Sigue apareciendo hasta que aprieten «Entendido», así no se pierde si ese día no entraron.
- Todos los anuncios (los de la Oficina, los del calendario y este) desaparecen cuando cada usuario aprieta «Entendido». Es por usuario: lo que borra uno no se lo borra a los demás. Los anuncios de la Oficina ahora se borran de verdad; antes solo se marcaban como leídos.
- Los anuncios del calendario ahora también aparecen arriba con su botón «Entendido».

## Codes 1.31 (30-oct-2026)
- Facturas: cada mes tiene ahora una **orejita** (flecha) para abrirlo o cerrarlo, así la lista no queda larguísima. Al entrar se ve abierto el mes más reciente y los demás cerrados; al lado de los filtros hay botones **«Abrir todos los meses»** y **«Cerrar todos»**. Cada mes cerrado sigue mostrando la cantidad de facturas, el débito y el crédito fiscal y el IVA del mes.

## Codes 1.32 (30-oct-2026)
- El **contador** ahora puede asociar o crear una factura en una transacción que ya está hecha (botón «Asociar a una factura o crear una» en el detalle). Sirve para cuando primero se paga y la factura llega días después.
- Solo puede hacer eso: no puede cambiar importes, fechas, medios de pago ni nada más de la transacción; eso sigue siendo del dueño. Al asociar la factura, la transacción queda marcada «con factura».
- Base de datos: nueva función `asociar_facturas` (valida proveedor, saldo de la factura y que no supere el total).

## Codes 1.33 (30-oct-2026)
- Corregido el error «column reference "x" is ambiguous» al marcar una transacción como «Sin factura» (o cambiarle el estado de factura). Venía de la función nueva de 1.32; ahora solo se usa cuando se asocian facturas, y marcar con/sin factura vuelve a guardarse como antes.

## Codes 1.34 (30-oct-2026)
- Recibo de sueldo: se sacó la leyenda del final («Modelo de recibo según el Decreto…», escala aplicada y aviso al contador). Los empleados ya no la ven.
- Emisión de recibos desde la planilla de horas (quincena o mes): al subir la planilla, los empleados que no tienen legajo se **crean solos** (con el convenio elegido arriba; después se completan DNI, CUIL y demás datos). Al apretar «Aceptar y emitir» se emiten todos los recibos y se **abre sola la impresión de todos juntos** en un único PDF, uno por hoja. El botón «Imprimir / guardar PDF de todos» sigue para volver a imprimirlos.

## Codes 1.35 (30-oct-2026)
- Una factura **cancelada** (le falta menos de $1) ya no se ofrece ni se puede asociar a otro pago. Antes, por centavos de redondeo, la factura B 0001-00000103 quedaba con $0,01 de saldo y el sistema se la pegaba a otro cobro (Certificado N.3 del 22/10). Ese vínculo de 1 centavo se sacó; esa transacción queda «Con fact., sin cargar» hasta que le asocien su factura real.
- Al asociar facturas a una transacción ya hecha (dueño y contadores), aparece el botón **«Ver también facturas de otros clientes/proveedores»** para elegir cualquier factura cargada con saldo; se puede seguir creando una factura nueva. La base de datos controla que sea del mismo tipo (venta/compra), que tenga saldo y que no pase el total.

## Codes 1.36 (30-oct-2026)
- Facturas: ahora se puede **cambiar el cliente o proveedor** de una factura aunque ya tenga pagos asociados (antes quedaba bloqueado). Sirve para corregir facturas cargadas con el cliente equivocado.

## Codes 1.37 (30-oct-2026)
- **Recibos emitidos:** casilleros para seleccionar recibos (y uno para marcar todos) y botón **«PDF de los N seleccionados»**, que arma un único PDF con todos juntos, ordenados por apellido, uno por hoja. También **«PDF de todos los emitidos»**.
- **Controlar antes de emitir:** en la importación de la planilla, nuevo botón **«Revisar los N en un PDF (borrador, sin emitir)»** con todos los recibos aceptados juntos, antes de apretar «Aceptar y emitir».
- **Corregir errores:** cada recibo emitido tiene **«Corregir»** (lo anula y abre el formulario con sus mismos datos para ajustarlo y emitirlo de nuevo) y **«Legajo»** (abre el legajo del empleado, por si el error está en sus datos: categoría, CUIL, etc.). Los recibos nuevos guardan los datos con los que se cargaron para poder corregirlos; los viejos se abren con empleado, período y fecha.

## Codes 1.38 (30-oct-2026)
- Recibo de sueldo: arriba a la derecha, en lugar del texto «CODES SRL», va el **logo completo de la empresa**; debajo siguen el CUIT y el domicilio cargados en Convenios. Sigue entrando en una sola hoja A4.

## Codes 1.39 (30-oct-2026)
- **Oficina → solapa «Obras y máquinas»:** cada obra activa es un terreno en isométrico y hay un terreno de **depósito / taller** para las máquinas paradas. Cada máquina tiene su dibujo (excavadora, pala cargadora, motoniveladora, camión, camioneta, tractor, rodillo/vibrador) y **trabaja** (se mueve) mientras está en una obra.
- **Se arrastra una máquina de un terreno a otro** para cambiarla de obra (también desde la ficha, con «Mover a»). La ubicación queda guardada y registrada en Auditoría. Lo pueden mover el dueño y el ingeniero; el contador la ve.
- **Al pasar el mouse por una máquina** (o tocarla en el celular) se abre su ficha: marca, modelo, año y patente; en qué obra está; litros y gasto de los últimos 30 días y totales; cantidad de cargas; precio medio por litro; litros cargados en esa obra; última carga y litros por tipo de combustible. Al pasar por el nombre de una obra se ve el combustible de esa obra.
- Base de datos: nueva columna `obra_actual_id` en centros de costo (`sql/18_maquina_obra_actual.sql`, ya aplicada).

## Codes 1.40 (30-oct-2026)
- **Obras y máquinas rediseñado como la oficina:** cada obra es un terreno con **piso de color por área** (azul, amarillo, verde, naranja, lila, como los pisos de la Oficina), con baldosas y su cartel de código y nombre.
- **Playa de máquinas abajo:** todas las máquinas sin obra aparecen abajo como dibujo con su código. Se **arrastran al terreno de su obra**, y se pueden volver a arrastrar a la playa para dejarlas sin obra. Ya no hay un terreno de depósito.
- **Ficha abajo:** al tocar una máquina, abajo se abre su ficha completa (dibujo, datos, obra actual, combustible últimos 30 días y totales, última carga, litros por tipo) y el selector «Mover a». Al pasar el mouse sigue saliendo un resumen corto.
- El **vibrador/compactador Dynamac** ahora se dibuja como compactador de suelo vial, con el rodillo al frente, y los camiones (incluido «Camiones Alquiler») se dibujan como camión.

## Codes 1.41 (30-oct-2026)
- **Las máquinas trabajan en cada obra:** las excavadoras/retros cavan pozos y cargan los camiones; los camiones van hasta el rincón de descarga, levantan la caja y vuelven; las palas cargadoras llevan tierra de un montón a otro; las motoniveladoras nivelan el suelo y dejan la huella clara; los compactadores pasan el rodillo y dejan la huella oscura; los tractores recorren el terreno y las camionetas van y vienen. Es ilustrativo, pero con movimiento realista (ruedas que giran, brazos y cajas que se mueven). Si el equipo tiene activado «reducir movimiento», se ve quieto.
- **Quitar una obra del gráfico:** con la × del cartel de cada terreno (dueño e ingeniero). Sus máquinas pasan a la playa. Arriba aparecen las obras quitadas para volver a ponerlas con un toque (↺).
- **Aspecto de cada máquina:** al tocarla, en la ficha se elige la **forma** (excavadora, pala, motoniveladora, camión, camioneta, tractor, compactador) y el **color** (paleta o color libre). Por defecto toma la **pintura de su marca** (Caterpillar amarillo, John Deere verde y amarillo, Komatsu, XCMG, Lonking, Liugong, Dynapac, Deutz-Fahr, Zanello, Chery, Mercedes-Benz, Toyota, Ford). Son colores aproximados, sin logos.
- Base de datos: `sql/19_obras_maquinas_aspecto.sql` (columnas `oculta_mapa`, `color_maquina`, `forma_maquina` en centros de costo; ya aplicada).

## Codes 1.42 (30-oct-2026)
- **Obras y máquinas en 3D** (como la Oficina y el video): cada obra es un terreno con piso de color, árboles y su cartel flotante; las máquinas son modelos 3D con su pintura de marca, y trabajan igual que antes (retros que cavan y cargan, camiones que descargan, palas, motoniveladoras, compactadores). Se gira con el mouse arrastrando el fondo, con los botones +, − y ⌂ (vista general) se acerca, aleja y vuelve. Se sigue arrastrando cada máquina de una obra a otra, y los códigos flotan arriba de cada una. Si el navegador no soporta 3D, se ve el dibujo plano de antes.
- **Solapa limpia:** en «Obras y máquinas» ya no aparecen el chat con el Director, la barra de agentes ni el panel de anuncios (eso queda solo en la Oficina 3D y el Organigrama).
- **Editar:** al tocar una máquina, en su ficha hay un botón «Editar datos de la máquina» que abre el formulario (marca, modelo, año, patente, notas) y al guardar o cancelar vuelve a la Oficina.
- **Agregar obra:** botón «+ Agregar obra» arriba, abre el formulario de nueva obra (dueño e ingeniero) y vuelve a la Oficina al terminar.

## Codes 1.43 (30-oct-2026)
- **Obras y máquinas 3D:** se saca la playa de máquinas del escenario; ahora las máquinas sin obra están en una tabla chica abajo a la izquierda («Sin obra», con su código y color). Se arrastran desde ahí a la obra, y se puede arrastrar una máquina de una obra a la tabla para dejarla sin obra. Al tocar un código de la tabla se abre su ficha. Las obras en ejecución ocupan todo el espacio.

## Codes 1.44 (30-oct-2026)
- **Obras y máquinas:** el fondo del escenario pasa a ser el mismo gris de la Oficina 3D (y sigue el modo claro/oscuro), en vez del fondo claro anterior.

## Codes 1.45 (30-oct-2026)
- **Obras y máquinas 3D:** el recuadro es más alto y la cámara arranca más cerca, así las obras y las máquinas se ven bastante más grandes y ocupan casi todo el espacio.

## Codes 1.46 (30-oct-2026)
- **Agregar obra solo con el nombre:** el botón «+ Agregar obra» de Obras y máquinas ya no abre el formulario completo ni la tabla de obras; muestra un campo para el nombre y listo. El código se genera solo (siguiente OBxx). Cliente y valor de contrato se completan después en Centro de costos (obras). Lo hace el dueño o el ingeniero.
- Base de datos: `sql/20_obra_alta_rapida.sql` (ya aplicada). El dueño puede crear una obra sin cliente ni contrato; al contador y a otros roles se les sigue exigiendo, y al dueño también si una obra ya completa pasara a quedar incompleta.
- **Terrenos más grandes y con paisaje:** cada terreno es bastante más grande (las máquinas conservan su tamaño), con un río por el fondo (con ondas que se mueven), árboles en los bordes y esquinas, y un borde de arena en el río.

## Codes 1.47 (30-oct-2026)
- **Obras y máquinas: la vista 3D no se abría** si se tocaba la solapa antes de que terminara de cargar la librería 3D, y quedaba el dibujo plano sin poder girar el mapa. Ahora espera a que cargue y recién ahí abre el 3D (con el río, los árboles y el giro con el mouse).
- Si el 3D no puede abrirse por otro motivo, arriba aparece el motivo en una línea naranja.
- **Nombre de la obra menos invasivo:** el cartel es más chico y translúcido, y va sobre el borde del fondo de cada terreno (no adelante). También en el dibujo plano, que ahora tiene su río.
- Una falla al armar un terreno ya no tira abajo toda la vista 3D.

## Codes 1.48 (30-oct-2026)
- **Obras y máquinas 3D:** el cartel con el nombre de cada obra sube a la zona gris, arriba del terreno, unido a su obra con una línea y un punto del color del área, para que se entienda a qué obra pertenece.
- **El terreno crece según las máquinas:** cuantas más máquinas tiene una obra, más grande es su terreno (de 6 a 11 o más casillas por lado), y la cámara se reacomoda.

## Codes 1.49 (30-oct-2026)
- **Obras y máquinas 3D, más limpio:** el código de cada máquina aparece solo cuando pasás el mouse por arriba de ella (o mientras la arrastrás). El cartel con el nombre de la obra aparece solo cuando hacés clic en ese terreno (con su línea al terreno); otro clic en el mismo terreno o en el fondo lo oculta. Al arrancar no hay ningún cartel.

## Codes 1.50 (30-oct-2026)
- **Máquinas que no se pisan en el mapa 3D:** cada máquina tiene su propio carril y horario. Los camiones esperan en fila, la retro los carga de a uno, salen cargados, dan la vuelta por el terreno hasta donde se descarga la tierra (donde está la pala), vuelcan y vuelven vacíos por otro carril. Palas, motoniveladoras y rodillos trabajan cada uno en su propia franja, y tractores y camionetas recorren el borde de la obra sin cruzarse con nada.
- El terreno se agranda lo justo para que entren todos los carriles. Si una retro tiene más de 3 camiones asignados, los de más quedan estacionados en fila para que no se amontonen.
- Probado con una simulación de 400 combinaciones de máquinas (sin ningún choque); no pude verlo en un navegador real con la librería 3D.

## Codes 1.51 (30-oct-2026)
- **Maquinaria → Accesorios:** nuevo grupo con botón "+ Nuevo accesorio". Tipos: desmalezadora, rastra, tanque regador, casilla y tanque de combustible. Los tres primeros se enganchan a un tractor o camioneta (se elige en "Enganchado a"); las casillas y los tanques de combustible no se enganchan.
- **Mapa 3D:** los accesorios enganchados van atrás del tractor o camioneta y se mueven con él (si movés el tractor a otra obra, el accesorio va con él). Las casillas y tanques de combustible asignados a una obra aparecen juntos en un pequeño campamento con piso de ripio, vallado y bandera, en el terreno de esa obra.
- **Tierra de punta a punta:** la pala ahora retira la tierra que descargan los camiones, la lleva a su carril y la deja en un montón; la motoniveladora la estría y después pasa el rodillo compactador por encima.
- Los dibujos y chips de los accesorios también aparecen en la playa y en las fichas. Base: columna `acoplado_a` (sql/21_accesorios.sql, ya aplicada).
- Probado con simulación de ~410 combinaciones (con accesorios y campamento) sin choques; no se vio en un navegador real con la librería 3D.

## Codes 1.52 (30-oct-2026)
- **Arrastrar un accesorio al mapa 3D:** al soltar una desmalezadora, rastra o tanque regador sobre una obra, aparece un cartel "¿A qué querés conectar…?" con los tractores y camionetas de esa obra (los que ya llevan un accesorio salen en gris), o la opción de dejarlo suelto. Si lo conectás, aparece enganchado atrás de ese tractor o camioneta.
- Las casillas y los tanques de combustible no preguntan nada: al soltarlos en una obra quedan armados como campamento.
- Si arrastrás un accesorio enganchado a otra obra, se desengancha del tractor y se vuelve a preguntar.

## Codes 1.53 (30-oct-2026)
- **Arreglado: accesorios enganchados quedaban quietos.** Cuando el accesorio (o la excavadora o pala principal) era el primero de la lista de la obra, el mapa 3D no lo ponía a trabajar. Ahora los accesorios enganchados se mueven atrás de su tractor o camioneta, y las excavadoras y palas del primer lugar también trabajan.
- **Enganchar desde la ficha:** al tocar un accesorio (desmalezadora, rastra o regador) aparece "Enganchado a", con los tractores y camionetas de su obra.
- **Cartel de la obra:** al hacer clic en un terreno, abajo aparece el cartel con todas las máquinas y accesorios de esa obra (con tipo y a qué están enganchados, o "campamento"). Tocando una máquina de la lista se abre su ficha.
- La rastra se dibuja con discos bien visibles (antes parecían palitos).

## Codes 1.54 (30-oct-2026)
- Los accesorios enganchados (desmalezadora, rastra, regador) ahora van pegados al tractor o camioneta: la barra de tiro llega casi hasta el enganche.

## Codes 1.55 (31-oct-2026)
- **Tanque regador:** tira gotas de agua por atrás mientras anda y deja el piso mojado (huella oscura azulada que se va secando de a poco).
- **Rastra y desmalezadora:** dejan un rastro detrás (tierra removida y pasto cortado) que se va borrando.
- **Arreglado:** la rastra ahora cambia de color cuando elegís un color (el bastidor toma el color; los discos quedan grises).
