import type { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../config/database.js';

export interface EmployeeBenefitDocument {
  companyCode: string;
  employeeNumber: string;
  category: string;
  name: string;
  unit: string;
  assigned: number;
  used: number;
  available: number;
  expiresAt: Timestamp | null;
  asOf: Timestamp;
  createdAt: Timestamp;
}

export type EmployeeBenefit = EmployeeBenefitDocument & { id: string };

export interface EmployeeBenefitIdentity {
  companyCode: string;
  employeeNumber: string;
}

export const EMPLOYEE_BENEFITS_COLLECTION = { collectionName: 'employeeBenefits' } as const;

export const employeeBenefitsRepository = {
  /** La vinculación se obtiene del usuario autenticado, nunca de parámetros del cliente. */
  async findIdentity(userId: string): Promise<EmployeeBenefitIdentity | undefined> {
    const snapshot = await db.collection('users').doc(userId).get();
    const data: unknown = snapshot.data();
    if (typeof data !== 'object' || data === null) return undefined;

    const user = data as Record<string, unknown>;
    if (
      user['active'] !== true ||
      user['portalEnabled'] !== true ||
      typeof user['companyCode'] !== 'string' ||
      user['companyCode'].trim() === '' ||
      typeof user['employeeNumber'] !== 'string' ||
      user['employeeNumber'].trim() === ''
    ) return undefined;

    return {
      companyCode: user['companyCode'],
      employeeNumber: user['employeeNumber'],
    };
  },

  async findForEmployee(identity: EmployeeBenefitIdentity): Promise<EmployeeBenefit[]> {
    // El filtro adicional por empresa impide entregar registros de un legajo homónimo de otra empresa.
    const snapshot = await db.collection(EMPLOYEE_BENEFITS_COLLECTION.collectionName)
      .where('employeeNumber', '==', identity.employeeNumber)
      .get();
    return snapshot.docs
      .map((doc): EmployeeBenefit => ({ ...(doc.data() as EmployeeBenefitDocument), id: doc.id }))
      .filter((benefit) => benefit.companyCode === identity.companyCode)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  },
};
