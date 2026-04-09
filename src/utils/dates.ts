const TZ = 'America/Bogota';

/** Returns true if the string is a date-only value like "2026-04-10" (no time component). */
function isDateOnly(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

/**
 * Format a date string to locale date (es-CO, America/Bogota).
 * Date-only strings (YYYY-MM-DD) are parsed as local calendar dates to avoid
 * UTC-midnight timezone shift (e.g. "2026-04-10" showing as April 9 in Bogota).
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  if (isDateOnly(dateStr)) {
    // Parse parts directly to avoid UTC interpretation
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CO');
  }
  return new Date(dateStr).toLocaleDateString('es-CO', { timeZone: TZ });
}

/**
 * Format a date to a locale datetime string (es-CO, America/Bogota).
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('es-CO', { timeZone: TZ });
}

/**
 * Human-friendly relative date label (Hoy, Mañana, day name, or short date).
 * Compares dates in America/Bogota timezone.
 */
export function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '';

  // Get today's date string in Bogota (YYYY-MM-DD via en-CA locale)
  const todayBogota = new Date().toLocaleDateString('en-CA', { timeZone: TZ });

  // Get target date in Bogota; if date-only string, use as-is to avoid UTC shift
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  const targetBogota = isDateOnly
    ? dateStr
    : new Date(dateStr).toLocaleDateString('en-CA', { timeZone: TZ });

  // Compare as plain dates (midnight local)
  const today = new Date(todayBogota + 'T00:00:00');
  const target = new Date(targetBogota + 'T00:00:00');

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  if (diffDays <= 6) return weekdays[target.getDay()];
  return target.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}
