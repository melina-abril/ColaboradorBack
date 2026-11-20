# Colaborador · base de datos

Cloud Firestore en modo nativo. El backend accede mediante `firebase-admin`; el frontend no accede directamente a Firestore. Por eso, `firestore.rules` deniega las lecturas y escrituras de clientes. Los esquemas de las colecciones están en `docs/collections/`.

## Desarrollo local

Se requiere Node.js 24 o posterior. Ejecuta `npm install` y, en una terminal, `npm run emulator`. El emulador de Firestore escucha en `127.0.0.1:8085` y su panel en el puerto `4005`.

En otra terminal, ejecuta `npm run seed:emulator` para aplicar los scripts disponibles de `firestore/seeds/` en orden de versión. El runner registra los scripts aplicados en `_seedHistory`; no edites un script que ya se haya aplicado. También puedes ejecutar `npm run check` para comprobar los scripts y `npm run test:seeds` para probar la carga en el emulador.

Para conectar el backend local, configura `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` en su entorno. Su API escucha en el puerto `8080`; el frontend Angular escucha en `4200`, dirige `/api` a esa API y no necesita credenciales de Firestore. Consulta `docs/backend/README.md` para arrancar el backend.

## Scripts y colecciones

| Script | Módulo | Colecciones |
|---|---|---|
| `firestore/seeds/V2__employee_home.js` | Inicio del colaborador | `leaveBalances`, `employeeRequests`, `calendarEvents`, `announcements` |
| `firestore/seeds/V3__employee_profile.js` | Mi perfil | `employeeProfiles`, `employeeTrainings` |
| `firestore/seeds/V4__employee_benefits.js` | Beneficios y saldos | `employeeBenefits` |
| `firestore/seeds/V6__overtime_records.js` | Horas extras | `overtimeRecords` |

Calendario personal de ausencias y feriados, Lectura de comunicados y Mis solicitudes no tienen scripts propios: usan colecciones ya creadas por Inicio. Acceso al portal tampoco tiene un script propio. Los números de versión de la tabla corresponden a los archivos de esos módulos; no se crean scripts vacíos para cubrir los números restantes.

## Administrador inicial y entornos reales

El administrador inicial se crea con la herramienta fija `scripts/create-admin.js`, no con un script de carga que contenga contraseñas. En el emulador, ejecuta `npm run create-admin:emulator -- --email=admin@example.com --name="Administrador de ejemplo"`. Puedes proporcionar la contraseña mediante `ADMIN_PASSWORD` en el entorno; si no la proporcionas, la herramienta genera una y la muestra una sola vez. Usa `--reset` para restablecer la contraseña de una cuenta existente. Configura `--role` con el código de administrador que exija el backend cuando corresponda.

Para un proyecto real, configura `GOOGLE_APPLICATION_CREDENTIALS` con la ruta de una cuenta de servicio autorizada y `FIREBASE_PROJECT_ID` con el identificador del proyecto. Ejecuta `npm run seed` para cargar los datos que correspondan y `npm run create-admin -- --email=admin@example.com --name="Administrador"` para crear el administrador. Revisa los datos de ejemplo antes de cargarlos en producción. Despliega las reglas y los índices con `npm run deploy:firestore`.
