import { Router } from 'express';
import { employeeHome2Router } from './modules/employee-home-2/employee-home-2.router.js';
import { overtimeRecordsRouter } from './modules/overtime-records/overtime-records.router.js';
import { employeeProfileRouter } from './modules/employee-profile/employee-profile.router.js';
import { employeeBenefitsRouter } from './modules/employee-benefits/employee-benefits.router.js';
import { employeeHomeRouter } from './modules/employee-home/employee-home.router.js';

export const apiRouter = Router();

// El módulo existente conserva la ruta del resumen; el nuevo añade calendario y comunicados.
apiRouter.use('/employee-homes', employeeHomeRouter);
apiRouter.use('/employee-homes', employeeHome2Router);
apiRouter.use('/overtime-records', overtimeRecordsRouter);
apiRouter.use('/employee-profiles', employeeProfileRouter);
apiRouter.use('/employee-benefits', employeeBenefitsRouter);
