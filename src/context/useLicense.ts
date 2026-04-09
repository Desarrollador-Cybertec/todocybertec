import { useContext } from 'react';
import { LicenseContext, type LicenseContextValue } from './licenseContextDef';

export function useLicense(): LicenseContextValue {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense debe usarse dentro de un LicenseProvider');
  }
  return context;
}
