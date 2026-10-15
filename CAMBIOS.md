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
