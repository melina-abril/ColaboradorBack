import type { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../config/database.js';
import { USERS_COLLECTION } from '../../shared/auth/auth.service.js';
import { withId } from '../../shared/db/db-utils.js';
import type { CalendarEventType, LeaveCategory, RequestStatus } from './employee-home.schemas.js';

export interface LeaveBalanceDocument {
  companyCode: string;
  employeeNumber: string;
  category: LeaveCategory;
  assignedDays: number;
  usedDays: number;
  availableDays: number;
  expiringDays: number | null;
  expiresAt: Timestamp | null;
  asOf: Timestamp;
  createdAt: Timestamp;
}
export type LeaveBalance = LeaveBalanceDocument & { id: string };

export interface EmployeeRequestDocument {
  companyCode: string;
  employeeNumber: string;
  category: LeaveCategory;
  startDate: Timestamp;
  endDate: Timestamp;
  submittedAt: Timestamp;
  status: RequestStatus;
  createdAt: Timestamp;
}
export type EmployeeRequest = EmployeeRequestDocument & { id: string };

export interface CalendarEventDocument {
  companyCode: string;
  employeeNumber: string | null;
  name: string;
  type: CalendarEventType;
  eventDate: Timestamp;
  requestId: string | null;
  createdAt: Timestamp;
}
export type CalendarEvent = CalendarEventDocument & { id: string };

export interface AnnouncementDocument {
  companyCode: string;
  employeeNumber: string | null;
  title: string;
  summary: string;
  publishedAt: Timestamp;
  createdAt: Timestamp;
}
export type Announcement = AnnouncementDocument & { id: string };

export interface EmployeeIdentity {
  companyCode: string;
  employeeNumber: string;
}

export const LEAVE_BALANCES_COLLECTION = { collectionName: 'leaveBalances' } as const;
export const EMPLOYEE_REQUESTS_COLLECTION = { collectionName: 'employeeRequests' } as const;
export const CALENDAR_EVENTS_COLLECTION = { collectionName: 'calendarEvents' } as const;
export const ANNOUNCEMENTS_COLLECTION = { collectionName: 'announcements' } as const;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** Las cuatro consultas se acotan primero a la empresa; el legajo nunca llega desde el cliente. */
export const employeeHomeRepository = {
  async findIdentity(userId: string): Promise<EmployeeIdentity | null> {
    // Se lee el usuario de la sesión existente, sin crear otra colección ni otro mecanismo de autenticación.
    // Si la vinculación o la habilitación del portal no están registradas, se deniega el acceso.
    const snapshot = await db.collection(USERS_COLLECTION.collectionName).doc(userId).get();
    const data: Record<string, unknown> | undefined = snapshot.data();
    if (!data || data.active !== true || data.portalEnabled !== true ||
        !isNonEmptyString(data.companyCode) || !isNonEmptyString(data.employeeNumber)) {
      return null;
    }
    return { companyCode: data.companyCode, employeeNumber: data.employeeNumber };
  },

  async findBalances(identity: EmployeeIdentity): Promise<LeaveBalance[]> {
    const snapshot = await db.collection(LEAVE_BALANCES_COLLECTION.collectionName)
      .where('companyCode', '==', identity.companyCode).get();
    return snapshot.docs
      .map((doc) => withId<LeaveBalanceDocument>(doc))
      .filter((item): item is LeaveBalance => item !== undefined && item.employeeNumber === identity.employeeNumber);
  },

  async findRequests(identity: EmployeeIdentity): Promise<EmployeeRequest[]> {
    const snapshot = await db.collection(EMPLOYEE_REQUESTS_COLLECTION.collectionName)
      .where('companyCode', '==', identity.companyCode).get();
    return snapshot.docs
      .map((doc) => withId<EmployeeRequestDocument>(doc))
      .filter((item): item is EmployeeRequest => item !== undefined && item.employeeNumber === identity.employeeNumber);
  },

  async findCalendarEvents(identity: EmployeeIdentity): Promise<CalendarEvent[]> {
    const snapshot = await db.collection(CALENDAR_EVENTS_COLLECTION.collectionName)
      .where('companyCode', '==', identity.companyCode).get();
    return snapshot.docs
      .map((doc) => withId<CalendarEventDocument>(doc))
      .filter((item): item is CalendarEvent => item !== undefined &&
        (item.employeeNumber === null || item.employeeNumber === identity.employeeNumber));
  },

  async findAnnouncements(identity: EmployeeIdentity): Promise<Announcement[]> {
    const snapshot = await db.collection(ANNOUNCEMENTS_COLLECTION.collectionName)
      .where('companyCode', '==', identity.companyCode).get();
    return snapshot.docs
      .map((doc) => withId<AnnouncementDocument>(doc))
      .filter((item): item is Announcement => item !== undefined &&
        (item.employeeNumber === null || item.employeeNumber === identity.employeeNumber));
  },
};
