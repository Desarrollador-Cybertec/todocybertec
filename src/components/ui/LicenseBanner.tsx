import { HiOutlineExclamationTriangle, HiOutlineNoSymbol } from 'react-icons/hi2';
import { useLicense } from '../../context/useLicense';

export function LicenseBanner() {
  const { status, message } = useLicense();

  if (status === 'expired') {
    return (
      <div className="flex items-center gap-3 bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-md">
        <HiOutlineExclamationTriangle className="h-6 w-6 shrink-0" />
        <span>
          {message || 'La suscripción ha vencido. El sistema opera en modo de solo lectura expandido. Contacta al administrador para renovar el plan.'}
        </span>
      </div>
    );
  }

  if (status === 'suspended') {
    return (
      <div className="flex items-center gap-3 bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-md">
        <HiOutlineNoSymbol className="h-6 w-6 shrink-0" />
        <span>
          {message || 'La suscripción está suspendida. No es posible crear o reactivar recursos. Contacta al administrador de tu cuenta.'}
        </span>
      </div>
    );
  }

  return null;
}
