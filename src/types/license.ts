export type LicenseErrorType =
  | 'license_denied'
  | 'license_expired'
  | 'license_suspended'
  | 'license_unavailable';

export interface LicenseErrorResponse {
  message: string;
  type: LicenseErrorType;
}

export type LicenseStatus = 'active' | 'expired' | 'suspended' | null;

export interface LicenseState {
  status: LicenseStatus;
  message: string | null;
}
