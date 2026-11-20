import type { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../config/database.js';
import { USERS_COLLECTION } from '../../shared/auth/auth.service.js';
import { nowTimestamp, toTimestamp, withId } from '../../shared/db/db-utils.js';
import { ForbiddenError, NotFoundError, BusinessRuleError } from '../../shared/errors/http-errors.js';
import type { OvertimeListQuery, OvertimeStatus, OvertimeType } from './overtime-records.schemas.js';

export interface OvertimeRecordDocument {
  companyId: string;
  employeeId: string;
  type: OvertimeType;
  status: OvertimeStatus;
  date: Timestamp;
  startTime: string;
  endTime: string;
  durationHours: number;
  reason: string;
  requestedBy: string;
  rejectionReason: string | null;
  reviewedAt: Timestamp | null;
  createdAt: Timestamp;
}

export type OvertimeRecord = OvertimeRecordDocument & { id: string };
export type NewOvertimeRecord = Omit<OvertimeRecordDocument, 'createdAt'>;
export interface EmployeeScope {
  companyId: string;
  employeeId: string;
}

export const OVERTIME_RECORDS_COLLECTION = { collectionName: 'overtimeRecords' } as const;
const collection = () => db.collection(OVERTIME_RECORDS_COLLECTION.collectionName);

/** La vinculación se lee del usuario autenticado; nunca se acepta del body ni de la query. */
export const overtimeRecordsRepository = {
  async scopeForUser(userId: string): Promise<EmployeeScope> {
    const snapshot = await db.collection(USERS_COLLECTION.collectionName).doc(userId).get();
    const data = snapshot.data();
    if (data?.active !== true || typeof data.companyId !== 'string' || !data.companyId ||
        typeof data.employeeId !== 'string' || !data.employeeId) {
      throw new ForbiddenError('Tu cuenta no está vinculada a un legajo habilitado.');
    }
    return { companyId: data.companyId, employeeId: data.employeeId };
  },

  async findPage(scope: EmployeeScope, query: OvertimeListQuery): Promise<{ items: OvertimeRecord[]; total: number; records: OvertimeRecord[] }> {
    // El índice desplegado no incluye un índice compuesto para empresa, legajo y fecha.
    // Se consulta solo el legajo; empresa, orden, totales y paginado se aplican antes de devolver datos.
    const snapshot = await collection().where('employeeId', '==', scope.employeeId).get();
    const records = snapshot.docs
      .map((doc) => ({ ...(doc.data() as OvertimeRecordDocument), id: doc.id }))
      .filter((record) => record.companyId === scope.companyId)
      .sort((a, b) => b.date.toMillis() - a.date.toMillis() || b.createdAt.toMillis() - a.createdAt.toMillis());
    const start = query.page * query.size;
    return { items: records.slice(start, start + query.size), total: records.length, records };
  },

  async findById(scope: EmployeeScope, id: string): Promise<OvertimeRecord | undefined> {
    const record = withId<OvertimeRecordDocument>(await collection().doc(id).get());
    return record?.companyId === scope.companyId && record.employeeId === scope.employeeId ? record : undefined;
  },

  async insert(id: string, document: NewOvertimeRecord): Promise<OvertimeRecord> {
    const saved: OvertimeRecordDocument = { ...document, createdAt: nowTimestamp() };
    await collection().doc(id).create(saved);
    return { ...saved, id };
  },

  /** La comprobación de propiedad y estado ocurre dentro de la misma transacción que la escritura. */
  async complete(scope: EmployeeScope, id: string, startTime: string, endTime: string, durationHours: number): Promise<OvertimeRecord> {
    const ref = collection().doc(id);
    return db.runTransaction(async (transaction): Promise<OvertimeRecord> => {
      const snapshot = await transaction.get(ref);
      const current = withId<OvertimeRecordDocument>(snapshot);
      if (!current || current.companyId !== scope.companyId || current.employeeId !== scope.employeeId) {
        throw new NotFoundError('El registro no está disponible.');
      }
      if (current.type !== 'PLANNED' || current.status !== 'PLANNED') {
        throw new BusinessRuleError('OVERTIME_NOT_PLANNED', 'Solo puedes completar horas previstas sin revisar.');
      }
      const changes = { type: 'WORKED' as const, status: 'PENDING' as const, startTime, endTime, durationHours };
      transaction.update(ref, changes);
      return { ...current, ...changes };
    });
  },
};
