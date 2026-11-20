# Colaborador · base de datos

Cloud Firestore en modo nativo. El backend accede mediante el SDK de administración; el frontend no se conecta directamente a Firestore. Por eso las reglas impiden el acceso desde clientes. Los índices compuestos se incorporan cuando una consulta del backend requiere filtrar por un campo y ordenar por otro; no hay consultas de ese tipo especificadas para este paso.

## Emulador y datos de ejemplo

Requiere Node.js 24 o posterior. Ejecuta `npm install` y, en una terminal, `npm run emulator`. Firestore escucha en `127.0.0.1:8085` y el panel del emulador en el puerto `4005`. En otra terminal ejecuta `npm run seed:emulator` para aplicar los scripts disponibles en `firestore/seeds` por orden de versión. El runner registra los scripts aplicados en `_seedHistory`; no modifiques un script que ya se haya aplicado.

Para conectar el backend local, configura `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` en su entorno. El backend escucha en el puerto `8080` y atiende al frontend en el puerto `4200`; el frontend no necesita credenciales de Firestore.

## Scripts y colecciones

| Script | Módulo | Colecciones |
|---|---|---|
| `firestore/seeds/V2__employee_home.js` | Inicio del colaborador | `leaveBalances`, `employeeRequests`, `calendarEvents`, `announcements` |
| `firestore/seeds/V3__employee_profile.js` | Mi perfil | `employeeProfiles`, `employeeTrainings` |
| `firestore/seeds/V4__employee_benefits.js` | Beneficios y saldos | `employeeBenefits` |
| `firestore/seeds/V6__overtime_records.js` | Horas extras | `overtimeRecords` |

Mis solicitudes utiliza `employeeRequests`, creada por Inicio del colaborador; Acceso al portal no crea una colección propia. Los esquemas de las colecciones creadas por cada script están en `docs/collections/`. El script compartido del core, si se genera, se ejecutará antes de los scripts de los módulos.

## Proyecto real

Configura `GOOGLE_APPLICATION_CREDENTIALS` con la ruta a una cuenta de servicio autorizada y `FIREBASE_PROJECT_ID` con el identificador del proyecto. Ejecuta `npm run seed` para aplicar los scripts pendientes y `npm run deploy:firestore` para desplegar reglas e índices. No incluyas credenciales en el repositorio.

Para crear el administrador inicial usa `npm run create-admin -- --email=admin@example.com --name="Administrador" --role=CODIGO_DE_ROL`, sustituyendo el rol por el código que acepta el backend. Establece `ADMIN_PASSWORD` en el entorno o deja que el comando genere una contraseña y la muestre una sola vez. Usa `--reset` para restablecerla. En el emulador está disponible `npm run create-admin:emulator`. Cuando se carguen usuarios de demostración mediante el core, la contraseña de demostración es `Demo1234!`; no se almacena en texto plano.
