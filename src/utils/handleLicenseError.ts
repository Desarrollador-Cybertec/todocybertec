import { ApiError } from '../api/client';
import type { LicenseContextValue } from '../context/licenseContextDef';
import { sileo } from 'sileo';

/**
 * Returns true if the error was a license error (handled),
 * false if it should be handled by the caller.
 */
export function handleLicenseError(error: unknown, license: LicenseContextValue): boolean {
  if (error instanceof ApiError && error.isLicenseError) {
    const lt = error.licenseType!;
    if (lt === 'license_denied') {
      sileo.warning({ title: 'Límite alcanzado', description: error.data.message });
    } else if (lt === 'license_expired') {
      license.setExpired(error.data.message);
    } else if (lt === 'license_suspended') {
      license.setSuspended(error.data.message);
    } else {
      sileo.error({ title: 'Servicio no disponible', description: error.data.message });
    }
    return true;
  }
  return false;
} 
