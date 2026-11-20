import { z } from 'zod';
import { pageQuerySchema } from '../../shared/http/page.js';

export const calendarQuerySchema = z.object({
  month: z.coerce.number({ error: 'Indica un mes válido.' }).int().min(1).max(12),
  year: z.coerce.number({ error: 'Indica un año válido.' }).int().min(1900).max(2100),
});
export type CalendarQuery = z.output<typeof calendarQuerySchema>;

export const announcementListQuerySchema = pageQuerySchema;
export type AnnouncementListQuery = z.output<typeof announcementListQuerySchema>;

export interface CalendarEventResponse {
  id: string;
  name: string;
  type: 'APPROVED_ABSENCE' | 'HOLIDAY';
  startDate: string;
  endDate: string;
  days: number | null;
  status: 'APPROVED' | null;
  requestId: string | null;
}

export interface CalendarResponse {
  employeeName: string;
  month: number;
  year: number;
  events: CalendarEventResponse[];
  totalEvents: number;
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  publishedAt: string;
  issuer: string;
  recipients: string;
  text: string;
}

export interface LeaveBalanceResponse {
  category: string;
  assignedDays: number;
  usedDays: number;
  availableDays: number;
  expiringDays: number | null;
  expiresAt: string | null;
}

export interface EmployeeSummaryResponse {
  employeeName: string;
  balances: LeaveBalanceResponse[];
  latestRequest: { id: string; category: string; status: string; submittedAt: string } | null;
  nextCalendarEvent: CalendarEventResponse | null;
  latestAnnouncement: AnnouncementResponse | null;
}
