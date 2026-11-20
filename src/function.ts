import type { Express } from 'express';
import { onRequest } from 'firebase-functions/v2/https';

/**
 * Despliegue en Cloud Functions (Firebase Hosting reenvía /api/** a esta function). La app se arma recién en la
 * primera request: así el análisis del deploy no evalúa config/ (que exige JWT_SECRET en producción).
 * JWT_SECRET viene de Secret Manager; el resto de la configuración, de .env.<proyecto>.
 */
let app: Promise<Express> | undefined;

export const api = onRequest(
  { region: 'us-central1', secrets: ['JWT_SECRET'], invoker: 'public', memory: '256MiB' },
  async (req, res) => {
    app ??= import('./app.js').then(({ createApp }) => createApp());
    (await app)(req, res);
  },
);
