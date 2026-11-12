# Conciliación de facturas con ARCA (12-nov-2026)
Datos corregidos para que enero–septiembre 2026 coincida con los Excel de ARCA (COMPRAS y VENTAS).
- Respaldo previo: tabla `facturas_bak_arca_20261112` (copia completa antes de tocar).
- 38 compras anuladas (ARCA no las tiene; ninguna tenía pagos).
- 97 compras cargadas (tiques A, recibos C, liquidaciones, notas de crédito, facturas de 2024 tomadas en 2026, etc.); 26 proveedores nuevos.
- 12 comprobantes corregidos (importe/IVA/período) + 16 con diferencias de centavos.
- Factura B 1-116 Aviación Civil: IVA $2.542.058,68. UPCN sin CUIT: su factura y su cobro pasaron al UPCN con CUIT.
- Período IVA: ARCA usa el período de registro (`periodo_iva`), no la fecha de emisión.
Resultado: misma cantidad de comprobantes por mes; totales e IVA iguales salvo centavos en dólares (conversión).
