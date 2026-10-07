# Puente Gmail ⇄ CODES Gestión (facturas recopiladas + calendario de cheques)

Qué hace (corre dentro de la cuenta **codessrl.sgo@gmail.com**, cada 10 minutos):
1. **Facturas**: lee mails con PDF adjunto, el sistema lee el PDF y, si es una factura a nombre de CODES SRL (CUIT 30-71700245-4), la deja en **Facturas recopiladas** como *Pendiente*. Nada entra a Facturas hasta apretar **Cargar al sistema**.
2. **Calendario**: cada cheque/Echeq en cartera o emitido crea un evento de día completo en el calendario compartido "CODES SRL" (en la fecha de pago); si se modifica se actualiza, si se cobra/deposita/endosa queda tachado en gris, si se anula se borra.

## Piezas
- `parser.js` – lector de facturas ARCA/AFIP (probado con Node).
- `index.ts` – Edge Function `puente` de Supabase (se llama con cabecera `x-clave`; en la base solo se guarda el hash en `ingesta_claves`).
- `apps_script_puente.gs` – script de Google.
- Tablas: `facturas_recopiladas`, `cheques_calendario`, `ingesta_claves`; bucket privado `facturas-recopiladas`.

## Instalación (una sola vez)
1. Desplegar la función `puente` (sin verificación JWT) con `index.ts` + `parser.js`.
2. Generar una clave y guardar su SHA-256 en `ingesta_claves` (la clave en claro solo va en el script).
3. Entrar a script.google.com con codessrl.sgo@gmail.com → Nuevo proyecto → pegar `apps_script_puente.gs`, poner la clave en `CLAVE`.
4. Ejecutar `instalar()` y autorizar Gmail, Calendar y conexión externa.

## Límites
- No es instantáneo: máximo ~10 minutos de demora.
- Los datos salen del texto del PDF: siempre se muestran para revisar; lo que no se pudo leer figura como *Revisar*.
- PDFs escaneados (imagen) no se pueden leer.
