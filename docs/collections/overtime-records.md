# Módulo: horas extras

## overtimeRecords

Cargas previstas o trabajadas y decisiones de RH. Id del documento: `OT-0001`, `OT-0002`… La empresa y el legajo se toman de la sesión; el colaborador no puede elegirlos. Los totales se calculan a partir de los registros del legajo: solo `WORKED` y `APPROVED` es compensable; `WORKED` y `PENDING` está pendiente de revisión; `PLANNED` cuenta como horas previstas.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| companyId | string | sí | Identificador de la empresa vinculada a la sesión |
| employeeId | string | sí | Identificador del legajo vinculado a la sesión |
| type | string | sí | `PLANNED` o `WORKED` |
| status | string | sí | `PLANNED`, `PENDING`, `APPROVED` o `REJECTED` |
| date | timestamp | sí | Fecha de las horas extras |
| startTime | string | sí | Hora de inicio, formato `HH:mm` |
| endTime | string | sí | Hora de fin, formato `HH:mm`; posterior a `startTime` en la misma fecha |
| durationHours | number | sí | Diferencia calculada entre los horarios, en horas (> 0) |
| reason | string | sí | Motivo de las horas extras, no vacío |
| requestedBy | string | sí | Persona que solicitó las horas, no vacía |
| rejectionReason | string \| null | no | Explicación de RH cuando el estado es `REJECTED` |
| reviewedAt | timestamp \| null | no | Fecha de la decisión de RH |
| createdAt | timestamp | sí | Alta del registro |

Completar una previsión actualiza el mismo documento: conserva `date`, `reason`, `requestedBy`, `companyId` y `employeeId`, reemplaza los horarios y la duración con los reales y establece `type` en `WORKED` y `status` en `PENDING`.

Índice compuesto: `companyId` asc + `employeeId` asc + `date` desc (registros del legajo de la empresa, del más reciente al más antiguo). El paso base debe incluirlo en `firestore.indexes.json`.
