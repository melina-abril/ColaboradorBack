import { Router } from 'express';
import { currentUser } from '../../shared/auth/current-user.js';
import { employeeBenefitsService } from './employee-benefits.service.js';

export const employeeBenefitsRouter = Router();

/** GET /api/employee-benefits */
employeeBenefitsRouter.get('/', async (_req, res) => {
  res.json(await employeeBenefitsService.listMyBenefits(currentUser(res).id));
});
