# Colaborador · backend

API REST para el Portal del colaborador. Requiere Node.js 24 o posterior y Cloud Firestore. El README principal y los archivos de configuración de Firestore pertenecen a la capa de base de datos y no se modifican aquí.

## Desarrollo

Inicia el emulador y carga los datos siguiendo el README de la base de datos. Después, en el entorno del backend, configura `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085`. Ejecuta `npm install` y `npm run dev`. La API escucha en el puerto 8080 por defecto.

Para compilar y ejecutar: `npm run build && npm start`.

La configuración lee `PORT` (8080 por defecto), `FRONT_URL` (origen permitido para el frontend; en desarrollo, `http://localhost:4200`), `FIREBASE_PROJECT_ID` y `FIRESTORE_EMULATOR_HOST` para la conexión local. En producción, configura `NODE_ENV=production` y un `JWT_SECRET` aleatorio de al menos 32 caracteres. Consulta `src/config/env.ts` y `src/config/database.ts` para las opciones adicionales de sesión y conexión. No uses el emulador en producción.

## Rutas

Todas las rutas de los módulos requieren sesión. `GET /api/health`, `POST /api/auth/login` y `POST /api/auth/logout` son públicas; `GET /api/auth/me` requiere sesión.

- Inicio del colaborador: `GET /api/employee-homes/summary` (conserva el módulo existente).
- Calendario personal y comunicados: `GET /api/employee-homes/calendar`, `GET /api/employee-homes/announcements` y `GET /api/employee-homes/announcements/:id`.
- Horas extras: `GET /api/overtime-records`, `GET /api/overtime-records/:id`, `POST /api/overtime-records` y `PATCH /api/overtime-records/:id/complete`.
- Mi perfil: `GET /api/employee-profiles/me`, `GET /api/employee-profiles/me/contract`, `GET /api/employee-profiles/me/trainings`, `POST /api/employee-profiles/me/trainings` y `GET /api/employee-profiles/me/trainings/:id/document`.
- Beneficios y saldos: `GET /api/employee-benefits`.

## Conexión con las otras capas

El frontend Angular escucha en `http://localhost:4200` y dirige `/api` a este backend en `http://localhost:8080`; habilita ese origen mediante `FRONT_URL`. El backend accede a Firestore, cuyo emulador local utiliza el proyecto `demo-app` y escucha en `127.0.0.1:8085`. El frontend no se conecta directamente a Firestore. Para crear el primer usuario, consulta las instrucciones de administrador inicial del README de la base de datos.
