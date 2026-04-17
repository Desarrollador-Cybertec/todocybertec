# Componentes Reutilizables

Componentes compartidos ubicados en `src/components/`. Se organizan por dominio funcional.

---

## UI Genérica — `src/components/ui/`

### Badge

**Archivo:** `src/components/ui/Badge.tsx`

```typescript
interface BadgeProps {
  children: ReactNode
  variant?: 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'indigo' | 'amber'
  size?: 'sm' | 'md'
  className?: string
}
```

Mapeos de variante automáticos:

| Función | Mapeo |
|---|---|
| `statusBadgeVariant(status)` | `draft→gray`, `pending→yellow`, `in_progress→blue`, `in_review→indigo`, `completed→green`, `rejected→red`, `cancelled→gray`, `overdue→orange`, `pending_assignment→amber` |
| `priorityBadgeVariant(priority)` | `low→gray`, `medium→blue`, `high→orange`, `urgent→red` |

Definidos en `src/components/ui/badge-variants.ts`.

---

### Skeleton (Loading States)

**Archivo:** `src/components/ui/Skeleton.tsx`

| Componente | Descripción |
|---|---|
| `Skeleton` | Div animado con pulse, acepta className |
| `SkeletonText` | Múltiples líneas de texto simulado |
| `SkeletonCard` | Tarjeta con icono, título y texto |
| `SkeletonTable` | Tabla con filas y columnas configurables |
| `SkeletonStatCards` | 4 tarjetas de estadísticas (dashboard) |
| `SkeletonDashboard` | Layout completo del dashboard |
| `SkeletonDetail` | Página de detalle con sidebar |
| `SkeletonList` | Lista vertical de tarjetas |
| `EmptyState` | Estado vacío con icono, título, descripción y acción |
| `Spinner` | Spinner circular animado (`sm` / `md` / `lg`) |
| `PageSpinner` | Spinner centrado en pantalla completa |

---

### Animaciones (Framer Motion)

**Archivo:** `src/components/ui/Animations.tsx`

| Componente | Props | Descripción |
|---|---|---|
| `PageTransition` | `children` | Fade in + slide up al montar |
| `StaggerList` | `children` | Contenedor que staggers hijos |
| `StaggerItem` | `children` | Hijo individual con stagger |
| `FadeIn` | `children, delay?` | Fade + slide con delay opcional |
| `SlideDown` | `children` | Expandir/colapsar con animación |

---

### ConfirmModal

**Archivo:** `src/components/ui/ConfirmModal.tsx`

```typescript
interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string    // default: 'Confirmar'
  cancelLabel?: string     // default: 'Cancelar'
  variant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}
```

Modal con overlay oscuro, botones de confirmar/cancelar. Variante `danger` usa botón rojo.

---

### DarkModeToggle

**Archivo:** `src/components/ui/DarkModeToggle.tsx`

Botón fijo en la esquina inferior derecha (`fixed bottom-6 right-6 z-50`). Alterna entre iconos de sol y luna con animación.

---

### LicenseBanner

**Archivo:** `src/components/ui/LicenseBanner.tsx`

Banner que aparece cuando la licencia está expirada o suspendida:
- **Expirada**: Fondo naranja, texto de advertencia
- **Suspendida**: Fondo rojo, texto de error

---

### CybertecLogo

**Archivo:** `src/components/ui/CybertecLogo.tsx`

```typescript
interface CybertecLogoProps {
  variant?: 'full' | 'compact' | 'isotipo'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}
```

Logo SVG de Cybertec con escudo y letra "C". Incluye gradientes y efectos de brillo.

| Variante | Contenido |
|---|---|
| `full` | Escudo + "CYBERTEC" + tagline |
| `compact` | Escudo + "CYBERTEC" |
| `isotipo` | Solo escudo |

---

## Guardias de Ruta — `src/components/guards/`

### ProtectedRoute

**Archivo:** `src/components/guards/ProtectedRoute.tsx`

```typescript
interface ProtectedRouteProps {
  allowedRoles?: RoleType[]
}
```

- Verifica `isAuthenticated` del AuthContext
- Si `allowedRoles` está definido, verifica que `user.role.slug` esté incluido
- Redirige a `/login` o `/dashboard` según el caso
- Muestra `PageSpinner` mientras carga

### GuestRoute

**Archivo:** `src/components/guards/GuestRoute.tsx`

- Redirige a `/dashboard` si el usuario está autenticado
- Muestra `PageSpinner` mientras verifica

---

## Layout — `src/components/layout/`

### AppLayout

**Archivo:** `src/components/layout/AppLayout.tsx`

Layout principal de la aplicación con sidebar y área de contenido.

**Estructura:**

```
┌──────────────────────────────────────────┐
│  [Mobile overlay]                         │
│  ┌──────────┬───────────────────────────┐│
│  │ Sidebar  │  Content Area             ││
│  │          │                           ││
│  │ • Logo   │  [LicenseBanner]          ││
│  │ • Nav    │  [Mobile header + bell]   ││
│  │ • User   │  <Outlet />              ││
│  │ • Logout │                           ││
│  │ • Footer │                           ││
│  └──────────┴───────────────────────────┘│
└──────────────────────────────────────────┘
```

**Elementos del sidebar:**
- Logo de la aplicación (imagen)
- Menú de navegación filtrado por rol del usuario
- Tarjeta de usuario (avatar, nombre, rol, área)
- Botón de cerrar sesión
- Logo de Insumma al pie

**Responsive:**
- Desktop: sidebar fijo a la izquierda
- Mobile: sidebar oculto, se muestra como overlay con botón hamburguesa

---

## Notificaciones — `src/components/notifications/`

### NotificationBell

**Archivo:** `src/components/notifications/NotificationBell.tsx`

Icono de campana en el header con badge de conteo de no leídas. Al hacer clic, abre el `NotificationPanel` posicionado debajo.

**Comportamiento:**
- Calcula posición del panel desde las coordenadas del botón
- Se cierra al hacer clic fuera (click-outside detection)
- Badge rojo con número de no leídas

### NotificationPanel

**Archivo:** `src/components/notifications/NotificationPanel.tsx`

```typescript
interface NotificationPanelProps {
  onClose: () => void
}
```

Panel desplegable con lista de notificaciones:
- **Tabs**: Todas, Organización, Personal
- **Botón**: Marcar todas como leídas
- **Items**: Emoji + mensaje + indicador de no leída
- **Navegación**: Click en notificación navega a la tarea relacionada
- **Footer**: Enlace a página completa de notificaciones

### SileoToaster

**Archivo:** `src/components/notifications/SileoToaster.tsx`

Configuración del proveedor de toasts Sileo:
- Posición: bottom-right
- Duración: 5000ms
- Colores personalizados para modo claro/oscuro
- Roundness: 14px

---

## Dashboard — `src/components/dashboard/`

### StatCard

**Archivo:** `src/components/dashboard/StatCard.tsx`

```typescript
interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string        // Color de acento (e.g., 'blue', 'green')
  delay?: number       // Delay para animación stagger
}
```

Tarjeta de estadística con icono, etiqueta y valor numérico. Animación hover con escala.

---

## Tareas — `src/components/tasks/`

### TaskStatusSelect

**Archivo:** `src/components/tasks/TaskStatusSelect.tsx`

Dropdown de selección de estado de tarea. Muestra los estados disponibles con sus colores correspondientes.
