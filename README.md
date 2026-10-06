# CODES Gestión

Sistema de gestión de **CODES Construcciones (CODES SRL)**: registra cada ingreso, egreso y movimiento interno con su centro de costo, forma de pago, cliente o proveedor y factura.

> **Estado:** el ingreso con usuario y contraseña ya funciona con Supabase. Las pantallas del sistema todavía usan **datos de ejemplo**: lo que se carga no se guarda al recargar. El siguiente paso es guardar transacciones, cheques y facturas en la base de datos.

## Qué hace

- **Totales al pie**: la lista de transacciones termina con ingresos, egresos, resultado e internos de lo que se ve en pantalla; se actualizan al filtrar o buscar y también salen en el Excel.
- **Transacciones**: ingresos, egresos y movimientos internos, con una o varias formas de pago (efectivo, transferencia, cheque, Echeq, depósito, extracción, tarjeta) en pesos, dólares o euros.
- **Reglas de cuentas**: el efectivo solo pasa por Caja General o Caja Dólares; transferencias, cheques propios y tarjetas, por Banco Patagonia, Banco Santiago del Estero o Mercado Pago.
- **Impuesto a los débitos y créditos (Ley 25.413)**: se genera solo, al 0,6 %, debajo del asiento que lo origina. Exento entre cuentas bancarias propias.
- **Retenciones y percepciones**: carga manual.
- **Cheques y Echeqs**: cartera, endosos, depósitos y almanaque mensual por fecha de pago.
- **Facturas**: emitidas y recibidas separadas por mes, aviso de factura repetida y posición de IVA mensual con arrastre del saldo a favor.
- **Centros de costo**: obras (con cliente y valor de contrato), máquinas y administración; saldo pendiente de cobro por obra y por cliente.
- **Modificar y eliminar (solo el dueño)**: en transacciones, cheques, facturas, centros de costo y clientes/proveedores se marcan una o varias filas; aparece una barra con **Modificar** (cada fila se edita en el lugar) y **Eliminar**. Antes de guardar o borrar sale un cartel que resume los cambios. Lo que está en uso (un cheque en una transacción, una factura con pagos, un centro con movimientos, un cliente con obras) no se puede eliminar y el cartel explica por qué.
- **Clientes y proveedores**: pantalla propia, y también se crean al vuelo desde Nueva transacción y desde Centros de costo. Los tipos de centro de costo también se pueden crear (con o sin cliente y contrato).
- **Resumen automático** por período, centro de costo, forma de pago, obra y cliente.
- **Resumen por cuenta** (solo lectura) con saldo acumulado.
- **Usuarios**: ingreso, alta propia de contadores y dos roles: **Dueño** (uno solo, puede modificar, anular y eliminar) y **Contador** (carga y consulta, sin modificar ni borrar). Todo queda en Auditoría con las iniciales de quien lo hizo.
- **Excel**: cada planilla se descarga en `.xlsx`.

## Usuarios y seguridad

- Cada persona crea su usuario con **email y contraseña** (mínimo 8 caracteres, letras y números) y confirma su email.
- El usuario queda **pendiente**: no puede ver nada hasta que un administrador lo habilita en **Usuarios**.
- Recuperación de contraseña por email.
- La base de datos solo deja leer o escribir a usuarios activos (Row Level Security) y registra todo en `auditoria` con las iniciales de quien lo hizo.
- Funciona en computadora y celular; en el celular se puede "Agregar a pantalla de inicio".

## Cómo abrirlo

- **En línea**: https://codesconstrucciones.com.ar/
- **En la computadora**: descargá el repositorio y abrí `index.html` en el navegador. No necesita instalar nada.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | El programa completo (una sola página) |
| `img/` | Logos de CODES e ícono |
| `sql/01_esquema.sql` | Base de datos: tablas, reglas, vistas de control y auditoría |
| `sql/02_seguridad_usuarios.sql` | Usuarios con aprobación del administrador y reglas de acceso |
| `sql/03_roles_dueno_contador.sql` | Roles Dueño y Contador: solo el dueño modifica o elimina |
| `sql/05_rol_lector_y_usuarios.sql` | Rol Lector (solo consulta) y eliminación de usuarios |
| `sql/06_existencia_inicial.sql` | Tipo de transacción «Existencia inicial» |
| `sql/07_ingenieria_obras.sql` | Sección Ingeniería/Obras: roles Ingeniero y Operario, contratistas, certificaciones, combustible y arreglos de maquinaria |
| `sql/04_guardado_tiempo_real.sql` | Guardado completo de transacciones, tipos de centro, tercero ARCA y Realtime |
| `CNAME` | Dominio propio de GitHub Pages (codesconstrucciones.com.ar) |
| `manifest.webmanifest` | Para instalarlo como app en el celular |
