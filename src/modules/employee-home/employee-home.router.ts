import { Router } from 'express';
import { currentUser } from '../../shared/auth/current-user.js';
import { employeeHomeService } from './employee-home.service.js';

export const employeeHomeRouter = Router();

/** GET /api/employee-homes/summary: la identidad proviene únicamente de la sesión. */
employeeHomeRouter.get('/summary', async (_req, res) => {
  res.json(await employeeHomeService.getEmployeeSummary(currentUser(res)));
});
