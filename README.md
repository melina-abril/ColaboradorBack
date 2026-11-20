# Colaborador · Cloud Firestore

Base de datos del Portal del colaborador. El backend accede mediante `firebase-admin`; el frontend no se conecta directamente a Firestore. Las reglas deniegan el acceso directo de clientes. Los índices compuestos se añadirán cuando los módulos definan consultas que filtren por un campo y ordenen por otro.

## Requisitos

Node.js 24 o posterior y npm. Ejecuta `npm install`.

## Emulador y carga de datos

En una terminal, ejecuta `npm run emulator`. Firestore escucha en `127.0.0.1:8085` y el panel del emulador está en `http://localhost:4005`.

En otra terminal, ejecuta `npm run seed:emulator` para aplicar los scripts disponibles en `firestore/seeds` por versión. El runner registra los scripts aplicados en `_seedHistory`; no edites un script que ya se haya aplicado. `npm run check` revisa los scripts sin cargarlos. También puedes ejecutar `npm run test:seeds` para iniciar el emulador y probar la carga en un solo comando.

Esta estructura inicial aún no incluye scripts de carga. Las colecciones aparecerán cuando se generen los módulos.

## Scripts y colecciones previstos

| Versión | Módulo | Colecciones |
|---|---|---|
| Sin script propio | Acceso al portal | Ninguna |
| V2, `V2__employee_home.js` | Inicio del colaborador | `leaveBalances`, `employeeRequests`, `calendarEvents`, `announcements` |

El script V2 todavía no forma parte de esta estructura inicial. No hay colecciones compartidas ni script de core en esta generación.

## Proyecto real

Configura `FIREBASE_PROJECT_ID` con el identificador de tu proyecto y `GOOGLE_APPLICATION_CREDENTIALS` con la ruta a un archivo de credenciales de servicio. No establezcas `FIRESTORE_EMULATOR_HOST` al trabajar contra el proyecto real. Ejecuta `npm run seed` para aplicar los scripts disponibles y `npm run deploy:firestore` para desplegar reglas e índices. Antes del despliegue, verifica que el proyecto seleccionado en Firebase CLI sea el previsto; `.firebaserc` usa `demo-app` por defecto para desarrollo.

Cuando el backend defina los roles y exista la colección `users`, crea el primer administrador con `npm run create-admin -- --email=admin@example.com --name="Administrador" --role=CODIGO_ADMIN`, sustituyendo el correo y `CODIGO_ADMIN` por los valores admitidos por el backend. Establece `ADMIN_PASSWORD` antes de ejecutarlo o deja que el comando genere una contraseña y la muestre una sola vez. Usa `--reset` para restablecerla. El acceso inicial a un entorno real no depende de contraseñas de los scripts de carga.

## Conexión con las otras capas

El backend está en otro repositorio y escucha en el puerto `8080`. Para conectarlo al emulador, configura `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085`; son los mismos nombres de variables que utiliza el backend. El frontend escucha en el puerto `4200` y llama al backend bajo `/api`; no necesita credenciales de Firestore ni acceso directo al emulador.
