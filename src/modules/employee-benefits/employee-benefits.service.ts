import { nowTimestamp, toIsoDateTime, toMoney } from '../../shared/db/db-utils.js';
import { ForbiddenError } from '../../shared/errors/http-errors.js';
import { employeeBenefitsRepository, type EmployeeBenefit } from './employee-benefits.repository.js';
import type { EmployeeBenefitResponse, EmployeeBenefitsResponse } from './employee-benefits.schemas.js';

const toResponse = (benefit: EmployeeBenefit): EmployeeBenefitResponse => ({
  id: benefit.id,
  category: benefit.category,
  name: benefit.name,
  unit: benefit.unit,
  assigned: toMoney(benefit.assigned),
  used: toMoney(benefit.used),
  available: toMoney(benefit.available),
  expiresAt: benefit.expiresAt === null ? null : toIsoDateTime(benefit.expiresAt),
});

export const employeeBenefitsService = {
  async listMyBenefits(userId: string): Promise<EmployeeBenefitsResponse> {
    const identity = await employeeBenefitsRepository.findIdentity(userId);
    if (!identity) {
      throw new ForbiddenError('No tienes un legajo verificado en una empresa con el portal habilitado.');
    }

    const benefits = await employeeBenefitsRepository.findForEmployee(identity);
    const latestAsOf = benefits.reduce(
      (latest, benefit) => Math.max(latest, benefit.asOf.toMillis()),
      0,
    );

    return {
      asOf: latestAsOf === 0
        ? toIsoDateTime(nowTimestamp())
        : toIsoDateTime(benefits.find((benefit) => benefit.asOf.toMillis() === latestAsOf)?.asOf ?? nowTimestamp()),
      benefits: benefits.map(toResponse),
    };
  },
};
