# CODES Gestión: estado para continuar (01/10/2026)

**Web:** https://facuyunes97.github.io/CODES-Gestion/
**Repo:** github.com/facuyunes97/CODES-Gestion (rama main). `index.html` tiene todo el programa en una sola página.
**Supabase:** proyecto `codes-gestion` (ref `ljnhikarhvwgbktkkzug`, sa-east-1). No tocar el proyecto `codes-construcciones`: es del sistema anterior y tiene datos reales.

## Hecho
- Pantallas: transacciones (ingreso/egreso/interno), formas de pago con reglas por cuenta, impuesto D/C 0,6 % automático (exento entre bancos propios), retenciones manuales, cheques/Echeqs con almanaque, facturas por mes, posición de IVA con arrastre, centros de costo con contrato y saldo pendiente, resúmenes, resumen por cuenta (solo lectura), auditoría, Excel, logo y colores de CODES, versión para celular.
- Base Supabase: tablas, validaciones, auditoría, RLS (copia en `sql/`).
- Usuarios reales con Supabase Auth: alta propia, confirmación por email y aprobación del dueño.
- Roles: **dueño** (solo Facundo, FY; único que modifica, anula o elimina) y **contador** (ve y carga, no modifica ni borra).
- URL Configuration de Supabase cargada para github.io.

## Pendiente
1. **Lo principal:** que las pantallas guarden y lean de Supabase. Hoy usan datos de ejemplo en memoria y se pierden al recargar. Orden propuesto: centros de costo y terceros, transacciones con pagos e impuesto D/C, saldos; después cheques, facturas e IVA.
2. Dominio codesconstrucciones.com.ar: Cloudflare y DNS listos, pero el CNAME se borró en GitHub. Volver a ponerlo en Settings → Pages → Custom domain y agregar `https://codesconstrucciones.com.ar/**` en las Redirect URLs de Supabase.
3. Cargar datos reales: clientes, proveedores, obras y saldos iniciales.
