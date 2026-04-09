import { createContext } from 'react';
import type { LicenseState } from '../types';

export interface LicenseContextValue extends LicenseState {
  setExpired: (message: string) => void;
  setSuspended: (message: string) => void;
  clearLicense: () => void;
  isBlocked: boolean;
}

export const LicenseContext = createContext<LicenseContextValue | null>(null);
