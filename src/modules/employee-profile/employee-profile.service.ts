import { Timestamp } from 'firebase-admin/firestore';
import type { CurrentUser } from '../../shared/auth/current-user.js';
import { newId } from '../../shared/db/db-utils.js';
import { BusinessRuleError, ForbiddenError, NotFoundError } from '../../shared/errors/http-errors.js';
import { employeeProfileRepository, type EmployeeProfile, type EmployeeTraining } from './employee-profile.repository.js';
import type { ProfileResponse, TrainingRequest, TrainingResponse } from './employee-profile.schemas.js';

const dateOnly = (value: Timestamp | null): string | null => value ? value.toDate().toISOString().slice(0, 10) : null;
const dateTime = (value: Timestamp | null): string | null => value ? value.toDate().toISOString() : null;

const toProfileResponse = (profile: EmployeeProfile): ProfileResponse => ({
  id: profile.id,
  firstName: profile.firstName,
  lastName: profile.lastName,
  documentType: profile.documentType,
  documentNumber: profile.documentNumber,
  birthDate: dateOnly(profile.birthDate),
  email: profile.email,
  phone: profile.phone,
  address: profile.address,
  companyName: profile.companyName,
  employeeNumber: profile.employeeNumber,
  position: profile.position,
  department: profile.department,
  hireDate: dateOnly(profile.hireDate),
  employmentStatus: profile.employmentStatus,
  workArrangement: profile.workArrangement,
  clientName: profile.clientName,
  projectName: profile.projectName,
  contract: profile.contractName && profile.contractStoragePath ? {
    name: profile.contractName,
    mimeType: profile.contractMimeType,
    sizeBytes: profile.contractSizeBytes,
    uploadedAt: dateTime(profile.contractUploadedAt),
  } : null,
});

const toTrainingResponse = (training: EmployeeTraining): TrainingResponse => ({
  id: training.id,
  type: training.type,
  name: training.name,
  institution: training.institution,
  obtainedAt: dateOnly(training.obtainedAt) ?? '',
  documentName: training.documentName,
});

const ownProfile = async (user: CurrentUser): Promise<EmployeeProfile> => {
  const matches = await employeeProfileRepository.findProfilesByEmail(user.email);
  // Sin una vinculación inequívoca no se revela ningún legajo, ni siquiera el primero.
  if (matches.length !== 1 || !matches[0].companyName || !matches[0].employeeNumber) {
    throw new ForbiddenError('Tu cuenta no está vinculada a un único legajo habilitado.');
  }
  return matches[0];
};

export interface ProfileFile {
  content: Buffer;
  name: string;
  mimeType: string;
}

const readFile = async (path: string | null, name: string | null, mimeType: string | null): Promise<ProfileFile> => {
  if (!path || !name) throw new NotFoundError('El documento no está disponible.');
  const content = await employeeProfileRepository.readFile(path);
  if (!content) throw new NotFoundError('El documento no está disponible.');
  return { content, name, mimeType: mimeType ?? 'application/octet-stream' };
};

const decodeDocument = (base64: string, mimeType: string): Buffer => {
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) {
    throw new BusinessRuleError('INVALID_DOCUMENT', 'Adjunta un archivo PDF, JPG o PNG.');
  }
  const content = Buffer.from(base64, 'base64');
  const valid = mimeType === 'application/pdf'
    ? content.subarray(0, 5).toString('ascii') === '%PDF-'
    : mimeType === 'image/png'
      ? content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : content.length >= 3 && content[0] === 255 && content[1] === 216 && content[2] === 255;
  if (!valid || content.length > 8 * 1024 * 1024) {
    throw new BusinessRuleError('INVALID_DOCUMENT', 'Adjunta un archivo PDF, JPG o PNG de hasta 8 MB.');
  }
  return content;
};

export const employeeProfileService = {
  async getMyProfile(user: CurrentUser): Promise<ProfileResponse> {
    return toProfileResponse(await ownProfile(user));
  },

  async getMyContract(user: CurrentUser): Promise<ProfileFile> {
    const profile = await ownProfile(user);
    if (!profile.contractStoragePath || !profile.contractName) {
      throw new NotFoundError('No hay un contrato disponible en tu legajo.');
    }
    return readFile(profile.contractStoragePath, profile.contractName, profile.contractMimeType);
  },

  async listMyTrainings(user: CurrentUser): Promise<TrainingResponse[]> {
    const profile = await ownProfile(user);
    const items = await employeeProfileRepository.listTrainings(profile.id);
    return items.sort((a, b) => b.obtainedAt.toMillis() - a.obtainedAt.toMillis()).map(toTrainingResponse);
  },

  async createMyTraining(user: CurrentUser, request: TrainingRequest): Promise<TrainingResponse> {
    const profile = await ownProfile(user);
    const content = decodeDocument(request.document.contentBase64, request.document.mimeType);
    const extensionMatches = request.document.mimeType === 'application/pdf'
      ? /\.pdf$/i.test(request.document.name)
      : request.document.mimeType === 'image/png'
        ? /\.png$/i.test(request.document.name)
        : /\.jpe?g$/i.test(request.document.name);
    if (!extensionMatches) throw new BusinessRuleError('INVALID_DOCUMENT', 'Adjunta un archivo PDF, JPG o PNG.');
    const obtainedAt = Timestamp.fromDate(new Date(`${request.obtainedAt}T00:00:00.000Z`));
    const training = await employeeProfileRepository.insertTraining(newId(), profile.id, {
      type: request.type,
      name: request.name,
      institution: request.institution,
      obtainedAt,
      documentName: request.document.name,
    }, content, request.document.mimeType);
    return toTrainingResponse(training);
  },

  async getMyTrainingDocument(user: CurrentUser, id: string): Promise<ProfileFile> {
    const profile = await ownProfile(user);
    const training = await employeeProfileRepository.findTraining(id);
    if (!training || training.employeeProfileId !== profile.id) {
      throw new NotFoundError('El documento no está disponible.');
    }
    return readFile(training.documentStoragePath, training.documentName, null);
  },
};
