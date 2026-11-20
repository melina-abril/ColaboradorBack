import { z } from 'zod';

export const TRAINING_TYPES = ['COURSE', 'CERTIFICATION', 'DEGREE'] as const;
export type TrainingType = (typeof TRAINING_TYPES)[number];

const validDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value <= new Date().toISOString().slice(0, 10);
};

/** El archivo se envía como base64 en JSON; se comprueba también su firma antes de guardarlo. */
export const trainingRequestSchema = z.object({
  type: z.enum(TRAINING_TYPES, { error: 'Selecciona un tipo de formación válido.' }),
  name: z.string({ error: 'Completa este campo.' }).trim().min(1, 'Completa este campo.').max(200),
  institution: z.string({ error: 'Completa este campo.' }).trim().min(1, 'Completa este campo.').max(200),
  obtainedAt: z.string({ error: 'Completa este campo.' }).refine(validDate, 'Ingresa una fecha de obtención válida.'),
  document: z.object({
    name: z.string({ error: 'Completa este campo.' }).trim().min(1, 'Completa este campo.').max(200),
    mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png'], { error: 'Adjunta un archivo PDF, JPG o PNG.' }),
    contentBase64: z.string({ error: 'Completa este campo.' }).min(1, 'Completa este campo.'),
  }),
});
export type TrainingRequest = z.output<typeof trainingRequestSchema>;

export const fileQuerySchema = z.object({
  disposition: z.enum(['inline', 'attachment']).default('inline'),
});
export type FileQuery = z.output<typeof fileQuerySchema>;

export const trainingIdSchema = z.object({
  id: z.string().trim().min(1, 'Indica la formación.'),
});

export interface ContractMetadata {
  name: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedAt: string | null;
}

export interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string | null;
  documentNumber: string | null;
  birthDate: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  companyName: string;
  employeeNumber: string;
  position: string | null;
  department: string | null;
  hireDate: string | null;
  employmentStatus: string | null;
  workArrangement: string | null;
  clientName: string | null;
  projectName: string | null;
  contract: ContractMetadata | null;
}

export interface TrainingResponse {
  id: string;
  type: TrainingType;
  name: string;
  institution: string;
  obtainedAt: string;
  documentName: string | null;
}
