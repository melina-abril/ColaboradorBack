import { Router } from 'express';
import { currentUser } from '../../shared/auth/current-user.js';
import { idParamSchema, parse } from '../../shared/http/validation.js';
import { announcementListQuerySchema, calendarQuerySchema } from './employee-home-2.schemas.js';
import { employeeHome2Service } from './employee-home-2.service.js';

/** Se monta bajo /api/employee-homes; app.ts ya exige una sesión válida. */
export const employeeHome2Router = Router();

employeeHome2Router.get('/summary', async (_req, res) => {
  const user = currentUser(res);
  res.json(await employeeHome2Service.summary(user.id, user.name));
});

employeeHome2Router.get('/calendar', async (req, res) => {
  const user = currentUser(res);
  res.json(await employeeHome2Service.calendar(user.id, user.name, parse(calendarQuerySchema, req.query)));
});

employeeHome2Router.get('/announcements', async (req, res) => {
  res.json(await employeeHome2Service.listAnnouncements(
    currentUser(res).id,
    parse(announcementListQuerySchema, req.query),
  ));
});

employeeHome2Router.get('/announcements/:id', async (req, res) => {
  const { id } = parse(idParamSchema, req.params);
  res.json(await employeeHome2Service.getAnnouncement(currentUser(res).id, id));
});
