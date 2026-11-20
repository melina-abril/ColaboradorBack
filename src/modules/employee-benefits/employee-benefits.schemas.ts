export interface EmployeeBenefitResponse {
  id: string;
  category: string;
  name: string;
  unit: string;
  assigned: number;
  used: number;
  available: number;
  expiresAt: string | null;
}

export interface EmployeeBenefitsResponse {
  asOf: string;
  benefits: EmployeeBenefitResponse[];
}
