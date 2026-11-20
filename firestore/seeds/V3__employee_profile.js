/**
 * Módulo: employee-profile. Perfiles laborales y formación del colaborador.
 * Los documentos de ejemplo no incluyen archivos: sus referencias quedan en null
 * hasta que RH incorpore un contrato o el colaborador adjunte un comprobante.
 */
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

const date = (value) => Timestamp.fromDate(new Date(`${value}T00:00:00Z`));

const employeeProfiles = [
  {
    id: "E-0001", firstName: "Ana", lastName: "Ejemplo", documentType: "DEMO", documentNumber: "DEMO-001",
    birthDate: "1992-04-12", email: "ana@example.com", phone: null, address: null,
    companyName: "Empresa de ejemplo", employeeNumber: "E-0001", position: "Analista de personas",
    department: "Recursos Humanos", hireDate: "2022-03-01", employmentStatus: "ACTIVE",
    workArrangement: "HYBRID", clientName: null, projectName: null
  },
  {
    id: "E-0002", firstName: "Bruno", lastName: "Ejemplo", documentType: "DEMO", documentNumber: "DEMO-002",
    birthDate: "1995-08-23", email: "bruno@example.com", phone: null, address: null,
    companyName: "Empresa de ejemplo", employeeNumber: "E-0002", position: "Desarrollador",
    department: "Tecnología", hireDate: "2023-06-15", employmentStatus: "ACTIVE",
    workArrangement: "REMOTE", clientName: "Cliente de ejemplo", projectName: "Portal interno"
  },
  {
    id: "E-0003", firstName: "Carla", lastName: "Ejemplo", documentType: "DEMO", documentNumber: "DEMO-003",
    birthDate: "1990-11-05", email: "carla@example.com", phone: null, address: null,
    companyName: "Empresa de ejemplo", employeeNumber: "E-0003", position: "Diseñadora",
    department: "Producto", hireDate: "2021-09-20", employmentStatus: "ACTIVE",
    workArrangement: "ONSITE", clientName: null, projectName: null
  }
];

const employeeTrainings = [
  { id: "TR-0001", employeeProfileId: "E-0001", type: "COURSE", name: "Gestión de equipos", institution: "Instituto de ejemplo", obtainedAt: "2024-05-01", documentName: null, documentStoragePath: null },
  { id: "TR-0002", employeeProfileId: "E-0002", type: "CERTIFICATION", name: "Fundamentos de desarrollo web", institution: "Academia de ejemplo", obtainedAt: "2025-02-01", documentName: null, documentStoragePath: null },
  { id: "TR-0003", employeeProfileId: "E-0003", type: "DEGREE", name: "Diseño gráfico", institution: "Universidad de ejemplo", obtainedAt: "2018-12-01", documentName: null, documentStoragePath: null }
];

exports.seed = async (db) => {
  const batch = db.batch();
  for (const { id, birthDate, hireDate, ...data } of employeeProfiles) {
    batch.set(db.collection("employeeProfiles").doc(id), {
      ...data,
      birthDate: date(birthDate),
      hireDate: date(hireDate),
      contractName: null,
      contractMimeType: null,
      contractSizeBytes: null,
      contractUploadedAt: null,
      contractStoragePath: null,
      createdAt: FieldValue.serverTimestamp()
    });
  }
  for (const { id, obtainedAt, ...data } of employeeTrainings) {
    batch.set(db.collection("employeeTrainings").doc(id), {
      ...data,
      obtainedAt: date(obtainedAt),
      createdAt: FieldValue.serverTimestamp()
    });
  }
  await batch.commit();
};
