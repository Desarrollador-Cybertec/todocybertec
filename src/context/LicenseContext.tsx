import { useCallback, useState, type ReactNode } from 'react';
import type { LicenseState } from '../types';
import { LicenseContext } from './licenseContextDef';

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LicenseState>({
    status: null,
    message: null,
  });

  const setExpired = useCallback((message: string) => {
    setState({ status: 'expired', message });
  }, []);

  const setSuspended = useCallback((message: string) => {
    setState({ status: 'suspended', message });
  }, []);

  const clearLicense = useCallback(() => {
    setState({ status: null, message: null });
  }, []);

  const isBlocked = state.status === 'expired' || state.status === 'suspended';

  return (
    <LicenseContext.Provider value={{ ...state, setExpired, setSuspended, clearLicense, isBlocked }}>
      {children}
    </LicenseContext.Provider>
  );
}
