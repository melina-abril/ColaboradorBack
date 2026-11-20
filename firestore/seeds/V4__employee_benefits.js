/**
 * Módulo employee-benefits: beneficios asignados y saldos de ejemplo.
 * companyCode y employeeNumber identifican al colaborador de la sesión; no son
 * referencias a documentos de otra colección.
 */
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

const at = (value) => Timestamp.fromDate(new Date(value));

const benefits = [
  { id: "BEN-1001-VACATION", companyCode: "DEMO", employeeNumber: "1001", category: "VACATION", name: "Vacaciones", unit: "DAYS", assigned: 20, used: 8, available: 12, expiresAt: "2027-03-31T00:00:00Z" },
  { id: "BEN-1001-STUDY", companyCode: "DEMO", employeeNumber: "1001", category: "STUDY", name: "Días de estudio", unit: "DAYS", assigned: 10, used: 2, available: 8, expiresAt: null },
  { id: "BEN-1001-MOVING", companyCode: "DEMO", employeeNumber: "1001", category: "MOVING", name: "Días por mudanza", unit: "DAYS", assigned: 2, used: 0, available: 2, expiresAt: null },
  { id: "BEN-1001-BONUS", companyCode: "DEMO", employeeNumber: "1001", category: "BONUS", name: "Bono de bienestar", unit: "ARS", assigned: 150000.00, used: 50000.00, available: 100000.00, expiresAt: "2026-12-31T00:00:00Z" },
];

exports.seed = async (db) => {
  const batch = db.batch();
  for (const { id, expiresAt, ...data } of benefits) {
    batch.set(db.collection("employeeBenefits").doc(id), {
      ...data,
      expiresAt: expiresAt === null ? null : at(expiresAt),
      asOf: at("2026-11-20T12:00:00Z"),
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
};
