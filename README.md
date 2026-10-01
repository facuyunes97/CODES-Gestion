# CODES Gestión

Sistema de gestión de **CODES Construcciones (CODES SRL)**: registra cada ingreso, egreso y movimiento interno con su centro de costo, forma de pago, cliente o proveedor y factura.

> **Estado: prototipo.** Funciona completo en el navegador con datos de ejemplo, pero todavía no guarda en una base de datos: al recargar la página vuelve a los datos de ejemplo. El paso siguiente es conectarlo a Supabase usando `sql/01_esquema.sql`.

## Qué hace

- **Transacciones**: ingresos, egresos y movimientos internos, con una o varias formas de pago (efectivo, transferencia, cheque, Echeq, depósito, extracción, tarjeta) en pesos, dólares o euros.
- **Reglas de cuentas**: el efectivo solo pasa por Caja General o Caja Dólares; transferencias, cheques propios y tarjetas, por Banco Patagonia, Banco Santiago del Estero o Mercado Pago.
- **Impuesto a los débitos y créditos (Ley 25.413)**: se genera solo, al 0,6 %, debajo del asiento que lo origina. Exento entre cuentas bancarias propias.
- **Retenciones y percepciones**: carga manual.
- **Cheques y Echeqs**: cartera, endosos, depósitos y almanaque mensual por fecha de pago.
- **Facturas**: emitidas y recibidas separadas por mes, aviso de factura repetida y posición de IVA mensual con arrastre del saldo a favor.
- **Centros de costo**: obras (con cliente y valor de contrato), máquinas y administración; saldo pendiente de cobro por obra y por cliente.
- **Resumen automático** por período, centro de costo, forma de pago, obra y cliente.
- **Resumen por cuenta** (solo lectura) con saldo acumulado.
- **Usuarios**: ingreso, alta propia de contadores, roles Administrador y Contador; todo queda en Auditoría con las iniciales de quien lo hizo.
- **Excel**: cada planilla se descarga en `.xlsx`.

## Cómo abrirlo

- **En línea**: desde la página de GitHub Pages del repositorio.
- **En la computadora**: descargá el repositorio y abrí `index.html` en el navegador. No necesita instalar nada.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | El programa completo (una sola página) |
| `img/` | Logos de CODES e ícono |
| `sql/01_esquema.sql` | Base de datos para Supabase/PostgreSQL: tablas, reglas, vistas de control y auditoría |
