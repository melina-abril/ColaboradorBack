# Módulo: inicio del colaborador

Los datos ficticios corresponden al legajo `E-0001` de la empresa `ACME`. El backend debe obtener ambos identificadores de la sesión y limitar las consultas a ellos; no debe aceptar un legajo elegido por el cliente. Los saldos son instantáneas de consulta de RH smart, no movimientos editables desde el portal.

## leaveBalances

Saldos por categoría. Id del documento: código de empresa, legajo y categoría (`ACME-E-0001-VACATION`).

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| companyCode | string | sí | Empresa del legajo |
| employeeNumber | string | sí | Legajo del colaborador |
| category | string | sí | `VACATION`, `STUDY` o `RELOCATION` |
| assignedDays | number | sí | Días asignados por la política de la empresa |
| usedDays | number | sí | Días utilizados según RH smart |
| availableDays | number | sí | Días disponibles; incluye los próximos a vencer |
| expiringDays | number \| null | no | Días disponibles próximos a vencer; no se suman nuevamente al saldo |
| expiresAt | timestamp \| null | no | Vencimiento de esos días |
| asOf | timestamp | sí | Fecha a la que corresponde el saldo |
| createdAt | timestamp | sí | Alta del documento de ejemplo |

Una categoría sin documento significa «Saldo no disponible», no cero días.

## employeeRequests

Solicitudes del legajo. Id del documento: código de solicitud (`REQ-0001`).

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| companyCode | string | sí | Empresa del legajo |
| employeeNumber | string | sí | Legajo del colaborador |
| category | string | sí | `VACATION`, `STUDY` o `RELOCATION` |
| startDate | timestamp | sí | Inicio del período solicitado |
| endDate | timestamp | sí | Fin del período solicitado |
| submittedAt | timestamp | sí | Fecha de envío; determina la última solicitud |
| status | string | sí | `PENDING`, `APPROVED` o `REJECTED` |
| createdAt | timestamp | sí | Alta del documento de ejemplo |

## calendarEvents

Feriados de la empresa y ausencias aprobadas del colaborador. Id del documento: código de evento (`CAL-0001`). Un feriado tiene `employeeNumber: null` y se aplica a la empresa; una ausencia tiene el legajo de su titular.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| companyCode | string | sí | Empresa a la que se aplica el evento |
| employeeNumber | string \| null | no | Legajo titular de una ausencia; null para feriados de la empresa |
| name | string | sí | Nombre visible del evento |
| type | string | sí | `HOLIDAY` o `APPROVED_ABSENCE` |
| eventDate | timestamp | sí | Fecha del evento |
| requestId | string → employeeRequests \| null | no | Solicitud aprobada asociada; null para feriados |
| createdAt | timestamp | sí | Alta del documento de ejemplo |

## announcements

Comunicados publicados para la empresa o para un colaborador. Id del documento: código de comunicado (`COM-0001`).

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| companyCode | string | sí | Empresa destinataria |
| employeeNumber | string \| null | no | Legajo destinatario; null si se publica para toda la empresa |
| title | string | sí | Título del comunicado |
| summary | string | sí | Texto de presentación |
| publishedAt | timestamp | sí | Publicación; determina el último comunicado |
| createdAt | timestamp | sí | Alta del documento de ejemplo |

Índices compuestos para las consultas del resumen:

- `employeeRequests`: `companyCode` asc + `employeeNumber` asc + `submittedAt` desc (última solicitud del legajo).
- `calendarEvents`: `companyCode` asc + `employeeNumber` asc + `eventDate` asc (ausencias del legajo); `companyCode` asc + `type` asc + `eventDate` asc (feriados de la empresa). Las consultas de ausencias y feriados se combinan para elegir la próxima fecha.
- `announcements`: `companyCode` asc + `employeeNumber` asc + `publishedAt` desc (comunicados personales); `companyCode` asc + `publishedAt` desc (comunicados de la empresa). Las consultas se combinan para elegir el más reciente.
