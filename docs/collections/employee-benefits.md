# Módulo: employee-benefits

## employeeBenefits

Beneficios y saldos de solo consulta. Id del documento: código fijo del beneficio y el legajo, por ejemplo `BEN-1001-VACATION`. Los datos de ejemplo corresponden a `companyCode=DEMO` y `employeeNumber=1001`. El backend debe tomar ambos identificadores de la sesión, nunca de parámetros proporcionados por el colaborador. Son identificadores de negocio, no referencias a documentos de otras colecciones. Los saldos representan movimientos y decisiones aprobadas por RH; este script solo carga valores de demostración.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| companyCode | string | sí | Código de la empresa vinculada a la sesión |
| employeeNumber | string | sí | Legajo vinculado a la sesión |
| category | string | sí | `VACATION`, `STUDY`, `MOVING` o `BONUS` |
| name | string | sí | Nombre visible del beneficio |
| unit | string | sí | `DAYS` para días o `ARS` para importes en pesos; no se suman unidades distintas |
| assigned | number | sí | Cantidad o importe asignado |
| used | number | sí | Cantidad o importe utilizado tras los movimientos y aprobaciones de RH |
| available | number | sí | Cantidad o importe disponible |
| expiresAt | timestamp \| null | no | Vencimiento; null indica que no hay vencimiento establecido |
| asOf | timestamp | sí | Fecha de referencia del saldo |
| createdAt | timestamp | sí | Alta del documento |

Cada documento representa un beneficio asignado: la ausencia de un documento de una categoría no equivale a un saldo de cero. Una consulta sin documentos es un resultado válido. No se modifican estos saldos desde el portal.

Índice compuesto: `companyCode` asc + `employeeNumber` asc + `asOf` desc, para consultar los beneficios del colaborador de la sesión ordenados por fecha de referencia.
