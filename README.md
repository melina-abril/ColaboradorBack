# Colaborador · base de datos

Cloud Firestore almacena los datos del portal. El backend accede mediante el SDK de administración; el frontend no se conecta directamente a Firestore. Las reglas impiden el acceso directo desde clientes.

## Requisitos y emulador

Se requieren Node.js 24 y npm. Instala las dependencias con `npm install` y arranca Firestore con `npm run emulator`. El emulador escucha en `127.0.0.1:8085` y su panel está en el puerto `4005`.

En otra terminal, ejecuta `npm run seed:emulator` para aplicar los scripts de `firestore/seeds` en orden de versión. El runner registra los scripts aplicados en `_seedHistory`; no modifiques un script ya aplicado. Puedes comprobar las cargas con `npm run check` y probarlas en un emulador temporal con `npm run test:seeds`.

| Versión | Módulo | Colecciones |
|---|---|---|
| V2 | Inicio del colaborador (`employee-home`) | `leaveBalances`, `employeeRequests`, `calendarEvents`, `announcements` |
| V3 | Mi perfil (`employee-profile`) | `employeeProfiles`, `employeeTrainings` |
| V4 | Beneficios y saldos (`employee-benefits`) | `employeeBenefits` |

El módulo `portal-access` no crea colecciones propias. La colección técnica `_seedHistory` pertenece exclusivamente al runner. Consulta `docs/collections/` para conocer los campos de cada colección.

## Conexión con el backend

El backend está en `https://github.com/melina-abril/ColaboradorBack` y escucha en el puerto `8080`. Para conectarlo al emulador, configura las mismas variables que utiliza la base: `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085`. El frontend está en `https://github.com/melina-abril/ColaboradorFront`, escucha en el puerto `4200` y llama al backend, no a esta base. El backend debe admitir `FRONT_URL=http://localhost:4200`.

## Administrador y entorno real

Para crear el administrador inicial, utiliza el script fijo `npm run create-admin:emulator -- --email=admin@example.com --name="Administrador"` en el emulador, o `npm run create-admin -- --email=admin@example.com --name="Administrador"` en el proyecto real. Indica `--role=<código de administrador configurado en el backend>` si es necesario. El script toma la contraseña de `ADMIN_PASSWORD` o genera una y la muestra una sola vez; `--reset` restablece la contraseña de una cuenta existente. No incluyas contraseñas en los scripts de carga.

Para usar un proyecto real, configura `GOOGLE_APPLICATION_CREDENTIALS` y `FIREBASE_PROJECT_ID`, ejecuta `npm run seed` y despliega las reglas e índices con `npm run deploy:firestore`. Ejecuta `npm run check` antes de cargar datos. Las reglas permanecen cerradas: el backend debe usar el SDK de administración.

`firestore.indexes.json` no declara índices compuestos todavía: incorpora uno cuando una consulta implementada filtre por un campo y ordene por otro, usando los nombres de campo del esquema correspondiente.
