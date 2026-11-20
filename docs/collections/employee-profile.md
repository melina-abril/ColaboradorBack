# Módulo: employee-profile

## employeeProfiles

Datos personales y laborales de consulta del legajo. Id del documento: número de legajo (`E-0001`…). El backend debe comprobar que el legajo y la empresa correspondan a la sesión antes de entregar datos o archivos. Los archivos no se cargan con este script; los campos del contrato permanecen en `null` hasta que RH incorpore uno.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| firstName | string | sí | Nombre |
| lastName | string | sí | Apellido |
| documentType | string | sí | Tipo de documento; `DEMO` identifica los datos ficticios de carga |
| documentNumber | string | sí | Identificador ficticio en los datos de carga |
| birthDate | timestamp | sí | Fecha de nacimiento |
| email | string | sí | Correo en minúsculas |
| phone | string \| null | no | Teléfono |
| address | string \| null | no | Domicilio |
| companyName | string | sí | Empresa del legajo |
| employeeNumber | string | sí | Número de legajo; coincide con el id del documento |
| position | string | sí | Puesto |
| department | string | sí | Área |
| hireDate | timestamp | sí | Fecha de ingreso |
| employmentStatus | string | sí | Estado laboral: `ACTIVE` o `INACTIVE` |
| workArrangement | string | sí | Modalidad: `ONSITE`, `HYBRID` o `REMOTE` |
| clientName | string \| null | no | Cliente asignado |
| projectName | string \| null | no | Proyecto asignado |
| contractName | string \| null | no | Nombre del archivo del contrato incorporado por RH |
| contractMimeType | string \| null | no | Tipo del archivo del contrato |
| contractSizeBytes | number \| null | no | Tamaño del contrato en bytes |
| contractUploadedAt | timestamp \| null | no | Fecha de incorporación del contrato |
| contractStoragePath | string \| null | no | Ubicación del contrato incorporado por RH; null si no existe |
| createdAt | timestamp | sí | Alta del documento |

## employeeTrainings

Formación registrada en el legajo. Id del documento: código fijo (`TR-0001`…). Los ejemplos representan registros anteriores sin documento; para una nueva carga se exige guardar el registro y su archivo juntos.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| employeeProfileId | string → employeeProfiles | sí | Legajo al que pertenece la formación |
| type | string | sí | `COURSE`, `CERTIFICATION` o `DEGREE` |
| name | string | sí | Nombre de la formación |
| institution | string | sí | Institución |
| obtainedAt | timestamp | sí | Fecha de obtención; no posterior a la fecha de registro |
| documentName | string \| null | no | Nombre del comprobante; null en registros anteriores sin archivo |
| documentStoragePath | string \| null | no | Ubicación del comprobante; null si no hay archivo |
| createdAt | timestamp | sí | Alta del registro |

Índices compuestos: ninguno. La consulta de formación por `employeeProfileId` usa el índice de campo único de Firestore.
