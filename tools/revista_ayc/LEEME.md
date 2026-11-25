# Carga mensual de la revista AYC

Los 572 ítems de `cotiz_items` (417 de mano de obra, fuente `ayc_mo`, y 155 del análisis de costos, fuente `ayc_costos`)
se revisaron a mano contra el PDF de noviembre 2026. La clave de cada ítem es (`fuente`, `codigo`): el código es el de la revista
(mano de obra: 1 a 417; análisis de costos: A.1, 1.1, 4.10, 6.2 bis, 21, 22, etc.).

## Cada mes (el PDF se adjunta desde la app: Base de precios → Revistas, queda «pendiente»)
1. Leer del PDF solo los números de cada código: `p_mo` (mano de obra), `p_mat` (materiales) y `p_tot` (total).
   En `ayc_mo` solo hay `p_mo`. Controlar que `p_mat + p_mo = p_tot`.
2. `update cotiz_items set p_mo=..., p_mat=..., p_tot=..., revista='AAAA-MM' where fuente=... and codigo=...`
3. Si la revista trae ítems nuevos: insertarlos con su código nuevo y completar `busq`
   (nombre + rubro + código, en minúsculas, sin tildes ni signos).
4. Si cambió una descripción o desapareció un ítem: avisar, no borrar (los presupuestos viejos pueden usarlo).
5. Marcar la fila de `cotiz_revistas` como `cargada` con la cantidad de ítems.

## Scripts de la primera carga (OCR con tesseract)
Orden: `lab*.py` (mano de obra), `an*.py` (análisis de costos), `build.py` (unifica y limpia).
Quedan como referencia: la primera carga se corrigió leyendo la revista a ojo, tira por tira.
