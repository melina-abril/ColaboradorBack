import { Router } from 'express';
import { employeeProfileRouter } from './modules/employee-profile/employee-profile.router.js';
import { employeeBenefitsRouter } from './modules/employee-benefits/employee-benefits.router.js';
import { employeeHomeRouter } from './modules/employee-home/employee-home.router.js';

export const apiRouter = Router();

apiRouter.use('/employee-profiles', employeeProfileRouter);
apiRouter.use('/employee-benefits', employeeBenefitsRouter);
apiRouter.use('/employee-homes', employeeHomeRouter);
