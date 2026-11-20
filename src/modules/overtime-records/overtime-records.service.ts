import { newId, toIsoDateTime, toMoney, toTimestamp } from '../../shared/db/db-utils.js';
import { NotFoundError } from '../../shared/errors/http-errors.js';
import { toPageResponse, type PageResponse } from '../../shared/http/page.js';
import { overtimeRecordsRepository, type OvertimeRecord } from './overtime-records.repository.js';
import type { CompleteOvertimeRequest, OvertimeListQuery, OvertimeRecordRequest, OvertimeRecordResponse, OvertimeTotalsResponse } from './overtime-records.schemas.js';

const duration = (start: string, end: string): number => {
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);
  return toMoney(((endHours ?? 0) * 60 + (endMinutes ?? 0) - (startHours ?? 0) * 60 - (startMinutes ?? 0)) / 60);
};

const toResponse = (record: OvertimeRecord): OvertimeRecordResponse => ({
  id: record.id,
  date: toIsoDateTime(record.date).slice(0, 10),
  startTime: record.startTime,
  endTime: record.endTime,
  type: record.type,
  status: record.status,
  durationHours: toMoney(record.durationHours),
  reason: record.reason,
  requestedBy: record.requestedBy,
  rejectionReason: record.rejectionReason,
  reviewedAt: record.reviewedAt === null ? null : toIsoDateTime(record.reviewedAt),
});

export const overtimeRecordsService = {
  async list(userId: string, query: OvertimeListQuery): Promise<PageResponse<OvertimeRecordResponse> & { totals: OvertimeTotalsResponse }> {
    const scope = await overtimeRecordsRepository.scopeForUser(userId);
    const { items, total, records } = await overtimeRecordsRepository.findPage(scope, query);
    const totals: OvertimeTotalsResponse = { availableForCompensation: 0, pendingReview: 0, plannedHours: 0 };
    for (const record of records) {
      if (record.type === 'WORKED' && record.status === 'APPROVED') totals.availableForCompensation += record.durationHours;
      if (record.type === 'WORKED' && record.status === 'PENDING') totals.pendingReview += record.durationHours;
      if (record.type === 'PLANNED' && record.status === 'PLANNED') totals.plannedHours += record.durationHours;
    }
    totals.availableForCompensation = toMoney(totals.availableForCompensation);
    totals.pendingReview = toMoney(totals.pendingReview);
    totals.plannedHours = toMoney(totals.plannedHours);
    return { ...toPageResponse(items.map(toResponse), total, query), totals };
  },

  async get(userId: string, id: string): Promise<OvertimeRecordResponse> {
    const scope = await overtimeRecordsRepository.scopeForUser(userId);
    const record = await overtimeRecordsRepository.findById(scope, id);
    if (!record) throw new NotFoundError('El registro no está disponible.');
    return toResponse(record);
  },

  async create(userId: string, request: OvertimeRecordRequest): Promise<OvertimeRecordResponse> {
    const scope = await overtimeRecordsRepository.scopeForUser(userId);
    const record = await overtimeRecordsRepository.insert(newId(), {
      ...scope,
      type: request.type,
      status: request.type === 'PLANNED' ? 'PLANNED' : 'PENDING',
      date: toTimestamp(`${request.date}T00:00:00.000Z`),
      startTime: request.startTime,
      endTime: request.endTime,
      durationHours: duration(request.startTime, request.endTime),
      reason: request.reason,
      requestedBy: request.requestedBy,
      rejectionReason: null,
      reviewedAt: null,
    });
    return toResponse(record);
  },

  async complete(userId: string, id: string, request: CompleteOvertimeRequest): Promise<OvertimeRecordResponse> {
    const scope = await overtimeRecordsRepository.scopeForUser(userId);
    const record = await overtimeRecordsRepository.complete(
      scope, id, request.startTime, request.endTime, duration(request.startTime, request.endTime),
    );
    return toResponse(record);
  },
};
