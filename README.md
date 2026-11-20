# Colaborador · Cloud Firestore

Base de datos del Portal del colaborador. Esta estructura inicial no contiene colecciones ni datos de ejemplo; los scripts de carga y esquemas se incorporan con las funcionalidades.

## Requisitos

- Node.js 24 o posterior.
- Java, requerido por el emulador de Firestore.

Instala las dependencias con `npm install`.

## Desarrollo local

Inicia el emulador con `npm run emulator`. Firestore escucha en `127.0.0.1:8085` y el panel del emulador está en `http://127.0.0.1:4005`.

En otra terminal, ejecuta `npm run seed:emulator` para aplicar los scripts disponibles. También puedes usar `npm run test:seeds` para iniciar el emulador, aplicar los scripts y detenerlo. En esta estructura inicial aún no hay scripts de carga.

El runner aplica los archivos de `firestore/seeds` por versión y registra los aplicados en `_seedHistory`. Usa `npm run check` para comprobar los scripts sin aplicarlos. No edites un script que ya se haya aplicado: incorpora los cambios en una versión nueva.

## Proyecto real

Configura `FIREBASE_PROJECT_ID` y `GOOGLE_APPLICATION_CREDENTIALS` con el identificador de tu proyecto y la ruta a una cuenta de servicio autorizada. Ejecuta `npm run seed` para cargar los scripts y `npm run deploy:firestore` para desplegar las reglas y los índices. No guardes el archivo de credenciales en el repositorio.

Cuando exista la colección de usuarios y se haya definido el código del rol administrador, crea la cuenta inicial con `npm run create-admin -- --email=admin@example.com --name="Administrador" --role=CODIGO_ADMIN`. El script toma la contraseña de `ADMIN_PASSWORD` o genera una y la muestra una sola vez. Para restablecerla, repite el comando con `--reset`. En el emulador se utiliza `npm run create-admin:emulator` con los mismos argumentos. No incluyas contraseñas en los scripts de carga.

## Esquema y scripts

| Parte | Colecciones | Scripts |
|---|---|---|
| Estructura inicial | Ninguna | Ninguno |

Cada funcionalidad que agregue colecciones documentará sus campos en `docs/collections` y aportará un script versionado en `firestore/seeds`. Los índices compuestos necesarios se incorporarán a `firestore.indexes.json`. Las reglas permanecen cerradas: el backend accede mediante el SDK de administrador, que no está sujeto a estas reglas.
