# Utilidades

Funciones helper ubicadas en `src/utils/`. Se re-exportan desde `src/utils/index.ts`.

---

## Fechas — `src/utils/dates.ts`

**Zona horaria:** `America/Bogota` (UTC-5)

### `formatDate(dateStr)`

Formatea una fecha a formato colombiano `DD/MM/YYYY`.

```typescript
formatDate('2026-04-10')           // → '10/04/2026'
formatDate('2026-04-10T14:30:00Z') // → '10/04/2026'
formatDate(null)                   // → '—'
```

**Comportamiento especial:**
- Cadenas con solo fecha (`YYYY-MM-DD`) se interpretan sin conversión UTC
- Cadenas con "Z" (Laravel UTC): se reemplaza "Z" por "-05:00" para interpretar en hora de Bogotá

### `formatDateTime(dateStr)`

Formatea fecha y hora: `DD/MM/YYYY, HH:MM:SS`.

```typescript
formatDateTime('2026-04-10T14:30:00Z') // → '10/04/2026, 09:30:00'
formatDateTime(null)                    // → '—'
```

### `formatRelativeDate(dateStr)`

Genera descripciones relativas de fechas en español.

```typescript
formatRelativeDate('2026-04-17') // → 'Hoy'       (si es hoy)
formatRelativeDate('2026-04-18') // → 'Mañana'
formatRelativeDate('2026-04-20') // → 'Domingo'    (dentro de 3 días)
formatRelativeDate('2026-04-15') // → 'Hace 2 días'
formatRelativeDate('2026-04-24') // → '24/04/2026' (más de 6 días)
```

**Lógica:**
- Hoy → `'Hoy'`
- Mañana → `'Mañana'`
- Dentro de 2-6 días → nombre del día de la semana
- Hace N días → `'Hace N días'` (si N ≤ 6)
- Otro caso → formato `DD/MM/YYYY`

---

## Tareas — `src/utils/tasks.ts`

### `idsMatch(a, b)`

Comparación segura de IDs que pueden ser `number`, `string` o `null`.

```typescript
idsMatch(1, '1')   // → true
idsMatch(1, 2)     // → false
idsMatch(null, 1)  // → false
```

### `statusProgress(status)`

Mapea el estado de una tarea a un porcentaje base de progreso.

| Estado | Progreso |
|---|---|
| `completed` | 100% |
| `in_review` | 75% |
| `in_progress`, `rejected`, `overdue` | 25% |
| Otros | 0% |

### `taskProgress(task)`

Calcula el progreso real de una tarea basado en milestones completados.

**Milestones (cada uno vale parte proporcional de 100%):**
1. **Iniciada**: estado ≠ draft/pending_assignment/pending
2. **Comentario** (si `requires_completion_comment`): tiene comentario de tipo `completion_note`
3. **Adjunto** (si `requires_attachment`): tiene al menos un adjunto
4. **Aprobación** (si `requires_manager_approval`): estado = `completed` y `closed_by` existe
5. **Completada**: estado = `completed`

**Regla**: Las tareas en progreso nunca llegan a 100% (se limita a `100 - step`).

### `PRIORITY_ORDER`

Orden de prioridades para sorting:

```typescript
const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}
```

---

## Toast de Notificaciones — `src/utils/notificationToast.ts`

### `showNotificationToast(notification)`

Muestra un toast visual cuando llega una notificación nueva.

**Comportamiento:**
- Usa la librería Sileo para el toast
- Incluye emoji + label + mensaje
- Tipo de toast según tipo de notificación:
  - `task_completed`, `task_approved` → `success`
  - `task_rejected`, `task_cancelled`, `task_overdue` → `error`
  - `task_due_soon`, `inactivity_alert` → `warning`
  - Otros → `info`
- Duración: 6000ms

---

## Manejo de Errores de Licencia — `src/utils/handleLicenseError.ts`

### `handleLicenseError(error, license)`

Detecta y maneja errores relacionados con la licencia del sistema.

```typescript
function handleLicenseError(
  error: unknown,
  license: LicenseContextValue
): boolean
```

**Retorna:** `true` si el error fue de licencia (fue manejado), `false` si no.

| Tipo de Error | Acción |
|---|---|
| `license_denied` | Toast de advertencia |
| `license_expired` | `license.setExpired(message)` |
| `license_suspended` | `license.setSuspended(message)` |
| `license_unavailable` | Toast de error |

---

## Guardia de Navegación — `src/utils/useNavigationGuard.ts`

### `useNavigationGuard(when)`

Hook que previene la navegación accidental cuando hay datos sin guardar.

```typescript
function useNavigationGuard(when: boolean): {
  isBlocked: boolean
  confirm: () => void
  cancel: () => void
  skip: () => void
}
```

**Parámetros:**
- `when`: Si es `true`, activa el bloqueo de navegación

**Retorna:**
- `isBlocked`: Indica si hay una navegación bloqueada pendiente
- `confirm()`: Confirma la navegación (permite salir)
- `cancel()`: Cancela la navegación (se queda en la página)
- `skip()`: Desactiva el bloqueo temporalmente (usar antes de `navigate()` tras guardar)

**Bloquea:**
- Clicks en `NavLink`
- Botones atrás/adelante del navegador
- Navegación programática

**Uso típico:**

```tsx
function MiFormulario() {
  const { isDirty } = useForm()
  const { isBlocked, confirm, cancel, skip } = useNavigationGuard(isDirty)

  const onSubmit = async (data) => {
    await api.save(data)
    skip()          // Desbloquea antes de navegar
    navigate('/list')
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>...</form>
      <ConfirmModal
        open={isBlocked}
        title="¿Salir sin guardar?"
        message="Hay cambios sin guardar"
        onConfirm={confirm}
        onCancel={cancel}
      />
    </>
  )
}
```

---

## Iconos de Área — `src/utils/areaIcons.tsx` + `src/utils/areaIconDefs.ts`

### Definiciones

44 iconos disponibles para áreas, organizados por categorías:

| Categoría | Iconos |
|---|---|
| **General** | office, briefcase, home, flag, star |
| **Personas** | users, user_group, academic, heart, support |
| **Tecnología** | desktop, code, terminal, cog, server, database, chip, lightning |
| **Finanzas** | dollar, trending, chart, scale |
| **Operaciones** | clipboard, cube, truck, archive |
| **Comunicación** | calendar, document, mail, chat, speaker |
| **Creatividad** | pencil, lightbulb, camera, color |
| **Seguridad** | shield, lock, beaker, fire |
| **Otros** | map, globe, collection, gift, newspaper, microphone, view_grid |

### Funciones

```typescript
interface AreaIconDef {
  key: string
  label: string
  icon: ComponentType
}

// Obtiene la definición de un icono por su key
getIconDef(key: string | null): AreaIconDef

// Componente que renderiza el icono
AreaIconDisplay({ iconKey, className }): JSX.Element
```

---

## Re-exportaciones — `src/utils/index.ts`

Archivo barrel que re-exporta todas las utilidades para imports limpios:

```typescript
import { formatDate, taskProgress, PRIORITY_ORDER } from '@/utils'
```
