# Colaborador · backend

El backend requiere Node.js 24 o posterior y la base Cloud Firestore descrita en el `README.md` de este repositorio. El archivo `README.md` de la raíz pertenece a la capa database y no se modifica aquí.

## Ejecutar

Inicia el emulador y carga los datos según el README de la base. Después ejecuta `npm install` y `npm run dev` para desarrollo, o `npm run build && npm start` para compilar y arrancar la API. La API escucha en el puerto 8080 para el proxy del frontend.

La configuración se lee del entorno; el proyecto dispone de un `.env.example` fijo. Para el emulador, usa `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085`. Configura `FRONT_URL=http://localhost:4200` para permitir el origen del frontend y `PORT=8080` para el puerto de la API. En producción configura `NODE_ENV=production` y un `JWT_SECRET` aleatorio de al menos 32 caracteres. Consulta el README de la base para crear el primer usuario; este backend no crea usuarios ni carga datos de ejemplo.

## Endpoints

Todos los endpoints de módulos requieren una sesión. La sesión y el endpoint de salud están implementados por los archivos fijos: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` y `GET /api/health`.

- Inicio del colaborador: `GET /api/employee-homes/summary`.
- Mi perfil: `GET /api/employee-profiles/me`, `GET /api/employee-profiles/me/contract`, `GET /api/employee-profiles/me/trainings`, `POST /api/employee-profiles/me/trainings` y `GET /api/employee-profiles/me/trainings/:id/document`.
- Beneficios y saldos: `GET /api/employee-benefits`.
- Horas extras: `GET /api/overtime-records`, `GET /api/overtime-records/:id`, `POST /api/overtime-records` y `PATCH /api/overtime-records/:id/complete`.

Mis solicitudes tiene previstos `GET /api/employee-requests`, `GET /api/employee-requests/:id` y `GET /api/employee-requests/form-access`, pero su módulo todavía no contiene un router. Esos endpoints no se montan hasta que se genere el módulo.

## Conexión con las otras capas

El frontend Angular escucha en `http://localhost:4200` y redirige `/api` a `http://localhost:8080`; el backend permite ese origen mediante `FRONT_URL`. En desarrollo, el backend se conecta al emulador Firestore del proyecto `demo-app` en `127.0.0.1:8085` mediante `FIREBASE_PROJECT_ID` y `FIRESTORE_EMULATOR_HOST`. El frontend no se conecta directamente a Firestore.
