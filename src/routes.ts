import { Router } from 'express';
import { employeeHomeRouter } from './modules/employee-home/employee-home.router.js';

export const apiRouter = Router();

apiRouter.use('/employee-homes', employeeHomeRouter);
