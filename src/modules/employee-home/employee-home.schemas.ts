export const LEAVE_CATEGORIES = ['VACATION', 'STUDY', 'RELOCATION'] as const;
export type LeaveCategory = (typeof LEAVE_CATEGORIES)[number];

export const REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const CALENDAR_EVENT_TYPES = ['HOLIDAY', 'APPROVED_ABSENCE'] as const;
export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];

export interface LeaveBalanceResponse {
  category: LeaveCategory;
  assignedDays: number;
  usedDays: number;
  availableDays: number;
  asOf: string;
}

export interface VacationExpirationResponse {
  days: number;
  expiresAt: string;
}

export interface LatestRequestResponse {
  id: string;
  category: LeaveCategory;
  startDate: string;
  endDate: string;
  submittedAt: string;
  status: RequestStatus;
}

export interface NextCalendarEventResponse {
  id: string;
  name: string;
  type: CalendarEventType;
  eventDate: string;
  requestId: string | null;
}

export interface LatestAnnouncementResponse {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
}

/** Un saldo ausente es null; nunca se representa como un saldo de cero. */
export interface EmployeeSummaryResponse {
  employeeName: string;
  asOf: string;
  balances: Record<LeaveCategory, LeaveBalanceResponse | null>;
  vacationExpiration: VacationExpirationResponse | null;
  latestRequest: LatestRequestResponse | null;
  nextCalendarEvent: NextCalendarEventResponse | null;
  latestAnnouncement: LatestAnnouncementResponse | null;
}
