import { z } from 'zod';
import { pageQuerySchema } from '../../shared/http/page.js';

export const OVERTIME_TYPES = ['PLANNED', 'WORKED'] as const;
export type OvertimeType = (typeof OVERTIME_TYPES)[number];

export const OVERTIME_STATUSES = ['PLANNED', 'PENDING', 'APPROVED', 'REJECTED'] as const;
export type OvertimeStatus = (typeof OVERTIME_STATUSES)[number];

const timeSchema = z.string({ error: 'Completa este campo.' }).regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Ingresa una fecha y un horario válidos.');
const requiredText = z.string({ error: 'Completa este campo.' }).trim().min(1, 'Completa este campo.').max(500, 'Usa hasta 500 caracteres.');

const scheduleSchema = z.object({
  startTime: timeSchema,
  endTime: timeSchema,
}).refine((value) => value.endTime > value.startTime, {
  path: ['endTime'],
  message: 'Ingresa una fecha y un horario válidos.',
});

export const overtimeRecordRequestSchema = scheduleSchema.safeExtend({
  type: z.enum(OVERTIME_TYPES, { error: 'Selecciona un tipo válido.' }),
  date: z.string({ error: 'Completa este campo.' }).refine((value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Ingresa una fecha y un horario válidos.'),
  reason: requiredText,
  requestedBy: requiredText,
});
export type OvertimeRecordRequest = z.output<typeof overtimeRecordRequestSchema>;

export const completeOvertimeRequestSchema = scheduleSchema;
export type CompleteOvertimeRequest = z.output<typeof completeOvertimeRequestSchema>;

export const overtimeListQuerySchema = pageQuerySchema;
export type OvertimeListQuery = z.output<typeof overtimeListQuerySchema>;

export interface OvertimeRecordResponse {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: OvertimeType;
  status: OvertimeStatus;
  durationHours: number;
  reason: string;
  requestedBy: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
}

export interface OvertimeTotalsResponse {
  availableForCompensation: number;
  pendingReview: number;
  plannedHours: number;
}
