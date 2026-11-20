import { toIsoDate, toIsoDateTime } from '../../shared/db/db-utils.js';
import { ForbiddenError, NotFoundError } from '../../shared/errors/http-errors.js';
import { toPageResponse, type PageResponse } from '../../shared/http/page.js';
import { employeeHome2Repository, type Announcement, type CalendarEvent, type EmployeeRequest } from './employee-home-2.repository.js';
import type { AnnouncementListQuery, AnnouncementResponse, CalendarEventResponse, CalendarQuery, CalendarResponse, EmployeeSummaryResponse } from './employee-home-2.schemas.js';

interface EmployeeIdentity {
  companyCode: string;
  employeeNumber: string;
}

const identityFor = async (userId: string): Promise<EmployeeIdentity> => {
  const identity = await employeeHome2Repository.findLinkedEmployee(userId);
  if (!identity) throw new ForbiddenError('Tu cuenta no está vinculada a un legajo habilitado.');
  return identity;
};

const visibleTo = (document: { companyCode: string; employeeNumber: string | null }, employee: EmployeeIdentity): boolean =>
  document.companyCode === employee.companyCode &&
  (document.employeeNumber === null || document.employeeNumber === employee.employeeNumber);

const toAnnouncement = (announcement: Announcement): AnnouncementResponse => ({
  id: announcement.id,
  title: announcement.title,
  publishedAt: toIsoDateTime(announcement.publishedAt),
  issuer: announcement.issuer ?? 'Recursos Humanos',
  recipients: announcement.recipients ?? (announcement.employeeNumber === null ? 'Colaboradores' : 'Colaborador'),
  text: announcement.text ?? announcement.summary,
});

const calendarEventsFor = (
  events: CalendarEvent[],
  requests: EmployeeRequest[],
  employee: EmployeeIdentity,
): CalendarEventResponse[] => {
  const approvedById = new Map(requests.filter((request) => request.status === 'APPROVED').map((request) => [request.id, request]));
  return events.filter((event) => visibleTo(event, employee)).flatMap((event): CalendarEventResponse[] => {
    if (event.type === 'HOLIDAY') {
      const date = toIsoDate(event.eventDate);
      return [{ id: event.id, name: event.name, type: 'HOLIDAY', startDate: date, endDate: date, days: null, status: null, requestId: null }];
    }
    if (event.type !== 'APPROVED_ABSENCE' || event.employeeNumber !== employee.employeeNumber) return [];
    const request = event.requestId === null ? undefined : approvedById.get(event.requestId);
    // Un evento vinculado a una solicitud pendiente, rechazada o ajena no es una ausencia aprobada.
    if (event.requestId !== null && !request) return [];
    return [{
      id: event.id,
      name: event.name,
      type: 'APPROVED_ABSENCE',
      startDate: request ? toIsoDate(request.startDate) : toIsoDate(event.eventDate),
      endDate: request ? toIsoDate(request.endDate) : toIsoDate(event.eventDate),
      days: null,
      status: 'APPROVED',
      requestId: request?.id ?? null,
    }];
  });
};

const announcementsFor = (announcements: Announcement[], employee: EmployeeIdentity): Announcement[] =>
  announcements.filter((item) => visibleTo(item, employee))
    .sort((left, right) => right.publishedAt.toMillis() - left.publishedAt.toMillis());

export const employeeHome2Service = {
  async summary(userId: string, employeeName: string): Promise<EmployeeSummaryResponse> {
    const employee = await identityFor(userId);
    const [balances, requests, events, announcements] = await Promise.all([
      employeeHome2Repository.findBalances(employee.companyCode, employee.employeeNumber),
      employeeHome2Repository.findRequests(employee.companyCode, employee.employeeNumber),
      employeeHome2Repository.findCalendarEvents(employee.companyCode),
      employeeHome2Repository.findAnnouncements(employee.companyCode),
    ]);
    const latestRequest = [...requests].sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis())[0];
    const now = new Date().toISOString().slice(0, 10);
    const nextCalendarEvent = calendarEventsFor(events, requests, employee)
      .filter((event) => event.endDate >= now)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;
    const latestAnnouncement = announcementsFor(announcements, employee)[0];
    return {
      employeeName,
      balances: balances.map((balance) => ({
        category: balance.category,
        assignedDays: balance.assignedDays,
        usedDays: balance.usedDays,
        availableDays: balance.availableDays,
        expiringDays: balance.expiringDays,
        expiresAt: balance.expiresAt ? toIsoDate(balance.expiresAt) : null,
      })),
      latestRequest: latestRequest ? {
        id: latestRequest.id,
        category: latestRequest.category,
        status: latestRequest.status,
        submittedAt: toIsoDateTime(latestRequest.submittedAt),
      } : null,
      nextCalendarEvent,
      latestAnnouncement: latestAnnouncement ? toAnnouncement(latestAnnouncement) : null,
    };
  },

  async calendar(userId: string, employeeName: string, query: CalendarQuery): Promise<CalendarResponse> {
    const employee = await identityFor(userId);
    const [storedEvents, requests] = await Promise.all([
      employeeHome2Repository.findCalendarEvents(employee.companyCode),
      employeeHome2Repository.findRequests(employee.companyCode, employee.employeeNumber),
    ]);
    const monthStart = `${query.year}-${String(query.month).padStart(2, '0')}-01`;
    const nextMonth = query.month === 12
      ? `${query.year + 1}-01-01`
      : `${query.year}-${String(query.month + 1).padStart(2, '0')}-01`;
    const events = calendarEventsFor(storedEvents, requests, employee)
      .filter((event) => event.startDate < nextMonth && event.endDate >= monthStart)
      .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id));
    return { employeeName, month: query.month, year: query.year, events, totalEvents: events.length };
  },

  async listAnnouncements(userId: string, query: AnnouncementListQuery): Promise<PageResponse<AnnouncementResponse>> {
    const employee = await identityFor(userId);
    const items = announcementsFor(await employeeHome2Repository.findAnnouncements(employee.companyCode), employee);
    const start = query.page * query.size;
    return toPageResponse(items.slice(start, start + query.size).map(toAnnouncement), items.length, query);
  },

  async getAnnouncement(userId: string, id: string): Promise<AnnouncementResponse> {
    const employee = await identityFor(userId);
    const announcement = await employeeHome2Repository.findAnnouncement(id);
    if (!announcement || !visibleTo(announcement, employee)) {
      throw new NotFoundError('El comunicado no está disponible.');
    }
    return toAnnouncement(announcement);
  },
};
