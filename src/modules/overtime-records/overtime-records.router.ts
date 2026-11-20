import { Router } from 'express';
import { currentUser } from '../../shared/auth/current-user.js';
import { idParamSchema, parse } from '../../shared/http/validation.js';
import { completeOvertimeRequestSchema, overtimeListQuerySchema, overtimeRecordRequestSchema } from './overtime-records.schemas.js';
import { overtimeRecordsService } from './overtime-records.service.js';

export const overtimeRecordsRouter = Router();

overtimeRecordsRouter.get('/', async (req, res) => {
  res.json(await overtimeRecordsService.list(currentUser(res).id, parse(overtimeListQuerySchema, req.query)));
});

overtimeRecordsRouter.get('/:id', async (req, res) => {
  const { id } = parse(idParamSchema, req.params);
  res.json(await overtimeRecordsService.get(currentUser(res).id, id));
});

overtimeRecordsRouter.post('/', async (req, res) => {
  const record = await overtimeRecordsService.create(currentUser(res).id, parse(overtimeRecordRequestSchema, req.body));
  res.status(201).json(record);
});

overtimeRecordsRouter.patch('/:id/complete', async (req, res) => {
  const { id } = parse(idParamSchema, req.params);
  res.json(await overtimeRecordsService.complete(currentUser(res).id, id, parse(completeOvertimeRequestSchema, req.body)));
});
