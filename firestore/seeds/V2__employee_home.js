/**
 * Módulo: inicio del colaborador. Datos ficticios de un mismo legajo y empresa.
 * Los saldos son instantáneas de consulta; las decisiones y movimientos pertenecen a RH smart.
 */
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

const at = (value) => Timestamp.fromDate(new Date(value));

const leaveBalances = [
  { id: "ACME-E-0001-VACATION", companyCode: "ACME", employeeNumber: "E-0001", category: "VACATION", assignedDays: 14, usedDays: 4, availableDays: 10, expiringDays: 3, expiresAt: "2026-12-31T00:00:00Z", asOf: "2026-11-20T00:00:00Z" },
  { id: "ACME-E-0001-STUDY", companyCode: "ACME", employeeNumber: "E-0001", category: "STUDY", assignedDays: 5, usedDays: 2, availableDays: 3, expiringDays: null, expiresAt: null, asOf: "2026-11-20T00:00:00Z" },
  { id: "ACME-E-0001-RELOCATION", companyCode: "ACME", employeeNumber: "E-0001", category: "RELOCATION", assignedDays: 2, usedDays: 0, availableDays: 2, expiringDays: null, expiresAt: null, asOf: "2026-11-20T00:00:00Z" },
];

const employeeRequests = [
  { id: "REQ-0001", companyCode: "ACME", employeeNumber: "E-0001", category: "VACATION", startDate: "2026-12-07T00:00:00Z", endDate: "2026-12-11T00:00:00Z", submittedAt: "2026-11-10T14:00:00Z", status: "APPROVED" },
  { id: "REQ-0002", companyCode: "ACME", employeeNumber: "E-0001", category: "RELOCATION", startDate: "2026-12-18T00:00:00Z", endDate: "2026-12-18T00:00:00Z", submittedAt: "2026-11-15T09:30:00Z", status: "REJECTED" },
  { id: "REQ-0003", companyCode: "ACME", employeeNumber: "E-0001", category: "STUDY", startDate: "2026-12-03T00:00:00Z", endDate: "2026-12-03T00:00:00Z", submittedAt: "2026-11-18T10:15:00Z", status: "PENDING" },
];

const calendarEvents = [
  { id: "CAL-0001", companyCode: "ACME", employeeNumber: null, name: "Día de la Soberanía Nacional", type: "HOLIDAY", eventDate: "2026-11-23T00:00:00Z", requestId: null },
  { id: "CAL-0002", companyCode: "ACME", employeeNumber: "E-0001", name: "Inicio de vacaciones aprobadas", type: "APPROVED_ABSENCE", eventDate: "2026-12-07T00:00:00Z", requestId: "REQ-0001" },
  { id: "CAL-0003", companyCode: "ACME", employeeNumber: null, name: "Navidad", type: "HOLIDAY", eventDate: "2026-12-25T00:00:00Z", requestId: null },
];

const announcements = [
  { id: "COM-0001", companyCode: "ACME", employeeNumber: null, title: "Actualización de beneficios", summary: "Consulta las novedades sobre los beneficios de la empresa.", publishedAt: "2026-11-05T12:00:00Z" },
  { id: "COM-0002", companyCode: "ACME", employeeNumber: null, title: "Calendario de fin de año", summary: "Ya puedes consultar los feriados y las fechas de diciembre.", publishedAt: "2026-11-12T12:00:00Z" },
  { id: "COM-0003", companyCode: "ACME", employeeNumber: null, title: "Novedades de Recursos Humanos", summary: "Conoce los canales de consulta disponibles para colaboradores.", publishedAt: "2026-11-19T12:00:00Z" },
];

exports.seed = async (db) => {
  const batch = db.batch();
  for (const { id, expiresAt, asOf, ...data } of leaveBalances) {
    batch.set(db.collection("leaveBalances").doc(id), {
      ...data,
      expiresAt: expiresAt === null ? null : at(expiresAt),
      asOf: at(asOf),
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  for (const { id, startDate, endDate, submittedAt, ...data } of employeeRequests) {
    batch.set(db.collection("employeeRequests").doc(id), {
      ...data,
      startDate: at(startDate),
      endDate: at(endDate),
      submittedAt: at(submittedAt),
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  for (const { id, eventDate, ...data } of calendarEvents) {
    batch.set(db.collection("calendarEvents").doc(id), {
      ...data,
      eventDate: at(eventDate),
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  for (const { id, publishedAt, ...data } of announcements) {
    batch.set(db.collection("announcements").doc(id), {
      ...data,
      publishedAt: at(publishedAt),
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
};
