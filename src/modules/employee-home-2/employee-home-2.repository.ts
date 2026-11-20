import type { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../config/database.js';
import { withId } from '../../shared/db/db-utils.js';

export interface CalendarEventDocument {
  companyCode: string;
  employeeNumber: string | null;
  name: string;
  type: 'APPROVED_ABSENCE' | 'HOLIDAY';
  eventDate: Timestamp;
  requestId: string | null;
  createdAt: Timestamp;
}
export type CalendarEvent = CalendarEventDocument & { id: string };
export const CALENDAR_EVENTS_COLLECTION = { collectionName: 'calendarEvents' } as const;

export interface AnnouncementDocument {
  companyCode: string;
  employeeNumber: string | null;
  title: string;
  summary: string;
  publishedAt: Timestamp;
  createdAt: Timestamp;
  issuer?: string;
  recipients?: string;
  text?: string;
}
export type Announcement = AnnouncementDocument & { id: string };
export const ANNOUNCEMENTS_COLLECTION = { collectionName: 'announcements' } as const;

export interface EmployeeRequestDocument {
  companyCode: string;
  employeeNumber: string;
  category: string;
  startDate: Timestamp;
  endDate: Timestamp;
  submittedAt: Timestamp;
  status: string;
  createdAt: Timestamp;
}
export type EmployeeRequest = EmployeeRequestDocument & { id: string };
export const EMPLOYEE_REQUESTS_COLLECTION = { collectionName: 'employeeRequests' } as const;

export interface LeaveBalanceDocument {
  companyCode: string;
  employeeNumber: string;
  category: string;
  assignedDays: number;
  usedDays: number;
  availableDays: number;
  expiringDays: number | null;
  expiresAt: Timestamp | null;
  asOf: Timestamp;
  createdAt: Timestamp;
}
export type LeaveBalance = LeaveBalanceDocument & { id: string };
export const LEAVE_BALANCES_COLLECTION = { collectionName: 'leaveBalances' } as const;

interface LinkedEmployee {
  companyCode: string;
  employeeNumber: string;
}

const isLinkedEmployee = (value: unknown): value is LinkedEmployee => {
  if (typeof value !== 'object' || value === null) return false;
  const fields = value as Record<string, unknown>;
  return typeof fields.companyCode === 'string' && fields.companyCode.length > 0 &&
    typeof fields.employeeNumber === 'string' && fields.employeeNumber.length > 0;
};

export const employeeHome2Repository = {
  /** La vinculación se lee del usuario autenticado, nunca de parámetros enviados por el cliente. */
  async findLinkedEmployee(userId: string): Promise<LinkedEmployee | undefined> {
    const user = await db.collection('users').doc(userId).get();
    const data: unknown = user.data();
    return isLinkedEmployee(data)
      ? { companyCode: data.companyCode, employeeNumber: data.employeeNumber }
      : undefined;
  },

  async findCalendarEvents(companyCode: string): Promise<CalendarEvent[]> {
    const snapshot = await db.collection(CALENDAR_EVENTS_COLLECTION.collectionName)
      .where('companyCode', '==', companyCode).get();
    return snapshot.docs.map((doc) => ({ ...(doc.data() as CalendarEventDocument), id: doc.id }));
  },

  async findAnnouncements(companyCode: string): Promise<Announcement[]> {
    const snapshot = await db.collection(ANNOUNCEMENTS_COLLECTION.collectionName)
      .where('companyCode', '==', companyCode).get();
    return snapshot.docs.map((doc) => ({ ...(doc.data() as AnnouncementDocument), id: doc.id }));
  },

  async findAnnouncement(id: string): Promise<Announcement | undefined> {
    return withId<AnnouncementDocument>(await db.collection(ANNOUNCEMENTS_COLLECTION.collectionName).doc(id).get());
  },

  async findRequests(companyCode: string, employeeNumber: string): Promise<EmployeeRequest[]> {
    const snapshot = await db.collection(EMPLOYEE_REQUESTS_COLLECTION.collectionName)
      .where('companyCode', '==', companyCode).get();
    return snapshot.docs
      .map((doc) => ({ ...(doc.data() as EmployeeRequestDocument), id: doc.id }))
      .filter((request) => request.employeeNumber === employeeNumber);
  },

  async findBalances(companyCode: string, employeeNumber: string): Promise<LeaveBalance[]> {
    const snapshot = await db.collection(LEAVE_BALANCES_COLLECTION.collectionName)
      .where('companyCode', '==', companyCode).get();
    return snapshot.docs
      .map((doc) => ({ ...(doc.data() as LeaveBalanceDocument), id: doc.id }))
      .filter((balance) => balance.employeeNumber === employeeNumber);
  },
};
