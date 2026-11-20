import type { CurrentUser } from '../../shared/auth/current-user.js';
import { toIsoDateTime } from '../../shared/db/db-utils.js';
import { ForbiddenError } from '../../shared/errors/http-errors.js';
import {
  employeeHomeRepository,
  type Announcement,
  type CalendarEvent,
  type EmployeeRequest,
  type LeaveBalance,
} from './employee-home.repository.js';
import {
  LEAVE_CATEGORIES,
  type EmployeeSummaryResponse,
  type LeaveCategory,
} from './employee-home.schemas.js';

const dateOnly = (value: { toDate(): Date }): string => value.toDate().toISOString().slice(0, 10);

const mostRecent = <T>(items: T[], dateOf: (item: T) => number): T | null =>
  items.reduce<T | null>((latest, item) =>
    latest === null || dateOf(item) > dateOf(latest) ? item : latest, null);

export const employeeHomeService = {
  async getEmployeeSummary(user: CurrentUser): Promise<EmployeeSummaryResponse> {
    const identity = await employeeHomeRepository.findIdentity(user.id);
    if (!identity) {
      throw new ForbiddenError('Tu cuenta no tiene un legajo vinculado o el portal no está habilitado para tu empresa.');
    }

    const now = new Date();
    const [balanceDocuments, requests, events, announcements] = await Promise.all([
      employeeHomeRepository.findBalances(identity),
      employeeHomeRepository.findRequests(identity),
      employeeHomeRepository.findCalendarEvents(identity),
      employeeHomeRepository.findAnnouncements(identity),
    ]);

    const balances: EmployeeSummaryResponse['balances'] = {
      VACATION: null,
      STUDY: null,
      RELOCATION: null,
    };
    for (const category of LEAVE_CATEGORIES) {
      const balance = mostRecent(
        balanceDocuments.filter((item: LeaveBalance) => item.category === category),
        (item: LeaveBalance) => item.asOf.toMillis(),
      );
      if (balance) {
        balances[category] = {
          category,
          assignedDays: balance.assignedDays,
          usedDays: balance.usedDays,
          availableDays: balance.availableDays,
          asOf: toIsoDateTime(balance.asOf),
        };
      }
    }

    const vacation = mostRecent(
      balanceDocuments.filter((item: LeaveBalance) => item.category === 'VACATION'),
      (item: LeaveBalance) => item.asOf.toMillis(),
    );
    const expiration = vacation?.expiresAt;
    const expiringDays = vacation?.expiringDays;
    const vacationExpiration = expiration && expiringDays !== null && expiringDays !== undefined &&
      expiringDays > 0 && vacation.availableDays > 0 && expiration.toMillis() >= now.getTime()
      ? { days: Math.min(expiringDays, vacation.availableDays), expiresAt: dateOnly(expiration) }
      : null;

    const latestRequest = mostRecent(requests, (item: EmployeeRequest) => item.submittedAt.toMillis());
    const upcomingEvent = events
      .filter((item: CalendarEvent) => item.eventDate.toMillis() >= now.getTime())
      .sort((left: CalendarEvent, right: CalendarEvent) => left.eventDate.toMillis() - right.eventDate.toMillis())[0];
    const latestAnnouncement = mostRecent(announcements, (item: Announcement) => item.publishedAt.toMillis());

    return {
      employeeName: user.name,
      asOf: now.toISOString(),
      balances,
      vacationExpiration,
      latestRequest: latestRequest ? {
        id: latestRequest.id,
        category: latestRequest.category as LeaveCategory,
        startDate: dateOnly(latestRequest.startDate),
        endDate: dateOnly(latestRequest.endDate),
        submittedAt: toIsoDateTime(latestRequest.submittedAt),
        status: latestRequest.status,
      } : null,
      nextCalendarEvent: upcomingEvent ? {
        id: upcomingEvent.id,
        name: upcomingEvent.name,
        type: upcomingEvent.type,
        eventDate: dateOnly(upcomingEvent.eventDate),
        requestId: upcomingEvent.requestId,
      } : null,
      latestAnnouncement: latestAnnouncement ? {
        id: latestAnnouncement.id,
        title: latestAnnouncement.title,
        summary: latestAnnouncement.summary,
        publishedAt: toIsoDateTime(latestAnnouncement.publishedAt),
      } : null,
    };
  },
};
