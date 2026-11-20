import { getApp } from 'firebase-admin/app';
import type { Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { db } from '../../config/database.js';
import { nowTimestamp, withId } from '../../shared/db/db-utils.js';
import type { TrainingType } from './employee-profile.schemas.js';

export interface EmployeeProfileDocument {
  firstName: string;
  lastName: string;
  documentType: string | null;
  documentNumber: string | null;
  birthDate: Timestamp | null;
  email: string;
  phone: string | null;
  address: string | null;
  companyName: string;
  employeeNumber: string;
  position: string | null;
  department: string | null;
  hireDate: Timestamp | null;
  employmentStatus: string | null;
  workArrangement: string | null;
  clientName: string | null;
  projectName: string | null;
  contractName: string | null;
  contractMimeType: string | null;
  contractSizeBytes: number | null;
  contractUploadedAt: Timestamp | null;
  contractStoragePath: string | null;
  createdAt: Timestamp;
}
export type EmployeeProfile = EmployeeProfileDocument & { id: string };

export interface EmployeeTrainingDocument {
  employeeProfileId: string;
  type: TrainingType;
  name: string;
  institution: string;
  obtainedAt: Timestamp;
  documentName: string | null;
  documentStoragePath: string | null;
  createdAt: Timestamp;
}
export type EmployeeTraining = EmployeeTrainingDocument & { id: string };

export const EMPLOYEE_PROFILES_COLLECTION = { collectionName: 'employeeProfiles' } as const;
export const EMPLOYEE_TRAININGS_COLLECTION = { collectionName: 'employeeTrainings' } as const;
const profiles = () => db.collection(EMPLOYEE_PROFILES_COLLECTION.collectionName);
const trainings = () => db.collection(EMPLOYEE_TRAININGS_COLLECTION.collectionName);

/** Las rutas gs:// siempre indican expresamente el bucket y el objeto. */
const storageFile = (path: string) => {
  const match = /^gs:\/\/([^/]+)\/(.+)$/.exec(path);
  if (!match) return null;
  return getStorage(getApp()).bucket(match[1]).file(match[2]);
};

export const employeeProfileRepository = {
  /** No se elige un legajo por parámetro: una cuenta debe corresponder a un único perfil. */
  async findProfilesByEmail(email: string): Promise<EmployeeProfile[]> {
    const result = await profiles().where('email', '==', email.toLowerCase()).limit(2).get();
    return result.docs.map((doc) => ({ ...(doc.data() as EmployeeProfileDocument), id: doc.id }));
  },

  async listTrainings(profileId: string): Promise<EmployeeTraining[]> {
    const result = await trainings().where('employeeProfileId', '==', profileId).get();
    return result.docs.map((doc) => ({ ...(doc.data() as EmployeeTrainingDocument), id: doc.id }));
  },

  async findTraining(id: string): Promise<EmployeeTraining | undefined> {
    return withId<EmployeeTrainingDocument>(await trainings().doc(id).get());
  },

  async readFile(path: string): Promise<Buffer | null> {
    const file = storageFile(path);
    if (!file) return null;
    const [exists] = await file.exists();
    if (!exists) return null;
    const [content] = await file.download();
    return content;
  },

  /** Primero sube el archivo; si falla la escritura del registro intenta retirar el archivo. */
  async insertTraining(id: string, profileId: string, data: Omit<EmployeeTrainingDocument, 'employeeProfileId' | 'documentStoragePath' | 'createdAt'>, content: Buffer, mimeType: string): Promise<EmployeeTraining> {
    const projectId = getApp().options.projectId;
    if (!projectId) throw new Error('Firebase no tiene un proyecto configurado.');
    const bucket = getStorage(getApp()).bucket(`${projectId}.firebasestorage.app`);
    const objectName = `employeeProfiles/${encodeURIComponent(profileId)}/trainings/${encodeURIComponent(id)}`;
    const file = bucket.file(objectName);
    await file.save(content, { resumable: false, contentType: mimeType });
    const document: EmployeeTrainingDocument = {
      ...data,
      employeeProfileId: profileId,
      documentStoragePath: `gs://${bucket.name}/${objectName}`,
      createdAt: nowTimestamp(),
    };
    try {
      await trainings().doc(id).create(document);
    } catch (error) {
      await file.delete({ ignoreNotFound: true }).catch(() => undefined);
      throw error;
    }
    return { ...document, id };
  },
};
