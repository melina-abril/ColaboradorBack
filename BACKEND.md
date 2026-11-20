# Colaborador · Backend

Estructura inicial de la API REST. Todavía no hay módulos de funcionalidad ni endpoints propios de módulos. El punto de entrada existente expone `GET /api/health` y las rutas de sesión bajo `/api/auth`.

## Requisitos y arranque

- Node.js 24 o posterior.
- Cloud Firestore disponible: en desarrollo, el emulador de la capa database escucha en `127.0.0.1:8085` con el proyecto `demo-app`.

Instala las dependencias con `npm install`. Para desarrollo, ejecuta `npm run dev`. Para compilar y arrancar, ejecuta `npm run build && npm start`. La API usa el puerto 8080 configurado por defecto en `src/config/env.ts`.

## Configuración

Consulta el archivo fijo `.env.example` para los valores de ejemplo y configura las variables que leen `src/config/env.ts` y `src/config/database.ts`. En desarrollo, utiliza `FIREBASE_PROJECT_ID=demo-app`, `GCLOUD_PROJECT=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` para conectarte al emulador. `PORT` configura el puerto de la API; configura también el origen permitido del frontend mediante la variable de CORS indicada en `.env.example`.

En producción, establece `NODE_ENV=production` y un `JWT_SECRET` aleatorio de al menos 32 caracteres. Configura el proyecto y las credenciales de Firebase conforme a las opciones del archivo fijo y no guardes secretos en el repositorio.

## Sesión

La sesión existente ofrece `POST /api/auth/login`, `POST /api/auth/logout` y `GET /api/auth/me`. El login consulta la colección `users` de Firestore. La base todavía no contiene colecciones ni usuarios de ejemplo: consulta el `README.md` de la capa database para preparar las colecciones y crear el primer usuario cuando estén disponibles.

## Integración con la base de datos

La capa database administra Firestore, sus reglas, índices y scripts de carga en este mismo repositorio. Arranca su emulador antes de usar la API y mantén iguales `FIREBASE_PROJECT_ID`, `GCLOUD_PROJECT` y `FIRESTORE_EMULATOR_HOST` en ambas capas. Este backend no crea colecciones ni ejecuta scripts de carga. El archivo `README.md` de la raíz pertenece a la capa database; esta guía se mantiene separada para no sobrescribirlo.
