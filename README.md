# CODES Gestión

Sistema de gestión de **CODES Construcciones (CODES SRL)**: registra cada ingreso, egreso y movimiento interno con su centro de costo, forma de pago, cliente o proveedor y factura.

> **Estado:** el ingreso con usuario y contraseña ya funciona con Supabase. Las pantallas del sistema todavía usan **datos de ejemplo**: lo que se carga no se guarda al recargar. El siguiente paso es guardar transacciones, cheques y facturas en la base de datos.

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

## Usuarios y seguridad

- Cada persona crea su usuario con **email y contraseña** (mínimo 8 caracteres, letras y números) y confirma su email.
- El usuario queda **pendiente**: no puede ver nada hasta que un administrador lo habilita en **Usuarios**.
- Recuperación de contraseña por email.
- La base de datos solo deja leer o escribir a usuarios activos (Row Level Security) y registra todo en `auditoria` con las iniciales de quien lo hizo.
- Funciona en computadora y celular; en el celular se puede "Agregar a pantalla de inicio".

## Cómo abrirlo

- **En línea**: desde la página de GitHub Pages del repositorio.
- **En la computadora**: descargá el repositorio y abrí `index.html` en el navegador. No necesita instalar nada.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | El programa completo (una sola página) |
| `img/` | Logos de CODES e ícono |
| `sql/01_esquema.sql` | Base de datos: tablas, reglas, vistas de control y auditoría |
| `sql/02_seguridad_usuarios.sql` | Usuarios con aprobación del administrador y reglas de acceso |
| `manifest.webmanifest` | Para instalarlo como app en el celular |
