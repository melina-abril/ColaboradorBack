import { Router } from 'express';
import { currentUser } from '../../shared/auth/current-user.js';
import { parse } from '../../shared/http/validation.js';
import { fileQuerySchema, trainingIdSchema, trainingRequestSchema, type FileQuery } from './employee-profile.schemas.js';
import { employeeProfileService, type ProfileFile } from './employee-profile.service.js';

export const employeeProfileRouter = Router();

const sendFile = (res: import('express').Response, file: ProfileFile, query: FileQuery): void => {
  const safeName = file.name.replace(/[\r\n"\\]/g, '_');
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `${query.disposition}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(file.name)}`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.send(file.content);
};

employeeProfileRouter.get('/me', async (_req, res) => {
  res.json(await employeeProfileService.getMyProfile(currentUser(res)));
});

employeeProfileRouter.get('/me/contract', async (req, res) => {
  const query = parse(fileQuerySchema, req.query);
  const file = await employeeProfileService.getMyContract(currentUser(res));
  sendFile(res, file, query);
});

employeeProfileRouter.get('/me/trainings', async (_req, res) => {
  res.json(await employeeProfileService.listMyTrainings(currentUser(res)));
});

employeeProfileRouter.post('/me/trainings', async (req, res) => {
  const request = parse(trainingRequestSchema, req.body);
  res.status(201).json(await employeeProfileService.createMyTraining(currentUser(res), request));
});

employeeProfileRouter.get('/me/trainings/:id/document', async (req, res) => {
  const { id } = parse(trainingIdSchema, req.params);
  const query = parse(fileQuerySchema, req.query);
  const file = await employeeProfileService.getMyTrainingDocument(currentUser(res), id);
  sendFile(res, file, query);
});
