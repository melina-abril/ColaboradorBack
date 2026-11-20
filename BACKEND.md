# Colaborador · backend

API REST del portal del colaborador. Este archivo documenta el backend por separado: `README.md` ya pertenece a la capa de base de datos en este repositorio.

## Requisitos y arranque

Se requieren Node.js 24, npm y Cloud Firestore. Instala las dependencias con `npm install`. Para desarrollo, arranca el emulador y aplica los datos de ejemplo siguiendo `README.md`; después ejecuta `npm run dev`. Para compilar y arrancar el código compilado, ejecuta `npm run build && npm start`.

La API escucha en el puerto `8080` de forma predeterminada. El backend no crea colecciones ni carga datos de ejemplo. Para crear el primer usuario, sigue las instrucciones de administración de `README.md`.

## Configuración

Las variables se configuran en el entorno; `src/config/env.ts` y `src/config/database.ts` contienen la configuración efectiva. `PORT` permite cambiar el puerto predeterminado `8080`. En desarrollo, usa `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` para conectar con el emulador de la base de datos; configura `GCLOUD_PROJECT=demo-app` si el entorno lo requiere. Configura `FRONT_URL=http://localhost:4200` para permitir el origen del frontend. Para producción, usa `NODE_ENV=production` y establece `JWT_SECRET` con un valor aleatorio de al menos 32 caracteres; configura las credenciales del proyecto Firestore según el entorno de despliegue. Consulta el `.env.example` existente para las demás opciones de sesión y conexión. No uses la configuración del emulador en producción.

## Endpoints

Todos los endpoints de los módulos requieren sesión. La infraestructura compartida proporciona `GET /api/health`, `POST /api/auth/login`, `POST /api/auth/logout` y `GET /api/auth/me`.

- **Mi perfil** (`employee-profile`): `GET /api/employee-profiles/me`, `GET /api/employee-profiles/me/contract`, `GET /api/employee-profiles/me/trainings`, `POST /api/employee-profiles/me/trainings` y `GET /api/employee-profiles/me/trainings/:id/document`.
- **Beneficios y saldos** (`employee-benefits`): `GET /api/employee-benefits`.
- **Inicio del colaborador** (`employee-home`): `GET /api/employee-homes/summary`.

## Conexión con las otras capas

El frontend está en `https://github.com/melina-abril/ColaboradorFront` y escucha en `4200`; su proxy envía `/api` a `http://localhost:8080`. El backend debe admitir `http://localhost:4200` mediante `FRONT_URL`. La base Firestore se configura en este mismo repositorio: su emulador escucha en `127.0.0.1:8085` y utiliza el proyecto `demo-app`. La API accede a Firestore mediante `firebase-admin`; el frontend no accede directamente a la base. Las colecciones, los scripts de carga y sus instrucciones están en `README.md` y `docs/collections/`.
