/**
 * Módulo: horas extras. Colección overtimeRecords.
 * companyId y employeeId deben coincidir con la empresa y el legajo de la sesión.
 */
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

const at = (value) => Timestamp.fromDate(new Date(value));

const overtimeRecords = [
  {
    id: "OT-0001", companyId: "C-0001", employeeId: "E-0001",
    type: "PLANNED", status: "PLANNED", date: "2026-11-25T00:00:00Z",
    startTime: "18:00", endTime: "20:00", durationHours: 2,
    reason: "Preparación de la entrega mensual", requestedBy: "Coordinación del proyecto",
    rejectionReason: null, reviewedAt: null
  },
  {
    id: "OT-0002", companyId: "C-0001", employeeId: "E-0001",
    type: "WORKED", status: "PENDING", date: "2026-11-18T00:00:00Z",
    startTime: "17:30", endTime: "19:00", durationHours: 1.5,
    reason: "Cierre de incidencias", requestedBy: "Coordinación del proyecto",
    rejectionReason: null, reviewedAt: null
  },
  {
    id: "OT-0003", companyId: "C-0001", employeeId: "E-0001",
    type: "WORKED", status: "APPROVED", date: "2026-11-12T00:00:00Z",
    startTime: "18:00", endTime: "20:30", durationHours: 2.5,
    reason: "Soporte durante el despliegue", requestedBy: "Responsable del equipo",
    rejectionReason: null, reviewedAt: "2026-11-13T14:00:00Z"
  },
  {
    id: "OT-0004", companyId: "C-0001", employeeId: "E-0001",
    type: "WORKED", status: "REJECTED", date: "2026-11-05T00:00:00Z",
    startTime: "18:00", endTime: "19:00", durationHours: 1,
    reason: "Revisión de documentación", requestedBy: "Responsable del equipo",
    rejectionReason: "La tarea se completó dentro de la jornada habitual.",
    reviewedAt: "2026-11-06T12:00:00Z"
  }
];

exports.seed = async (db) => {
  const batch = db.batch();
  for (const { id, date, reviewedAt, ...data } of overtimeRecords) {
    batch.set(db.collection("overtimeRecords").doc(id), {
      ...data,
      date: at(date),
      reviewedAt: reviewedAt === null ? null : at(reviewedAt),
      createdAt: FieldValue.serverTimestamp()
    });
  }
  await batch.commit();
};
