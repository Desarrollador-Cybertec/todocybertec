# Rutas y Navegación

## Resumen

El enrutamiento se gestiona con **React Router v7** dentro de `App.tsx`. Todas las rutas están protegidas por guardias que verifican autenticación y roles.

## Guardias de Ruta

### `GuestRoute`
- Redirige usuarios autenticados a `/dashboard`
- Muestra spinner mientras verifica estado de auth

### `ProtectedRoute`
```typescript
interface ProtectedRouteProps {
  allowedRoles?: RoleType[]
}
```
- Requiere autenticación activa
- Si se proporcionan `allowedRoles`, valida que el rol del usuario esté incluido
- Redirige a `/login` si no hay sesión
- Redirige a `/dashboard` si el rol no es permitido

## Tabla de Rutas

| Ruta | Página | Roles Permitidos |
|---|---|---|
| `/login` | `LoginPage` | Solo invitados (no autenticados) |
| `/dashboard` | `DashboardPage` | Todos los autenticados |
| `/tasks` | `TaskListPage` | Todos |
| `/tasks/create` | `TaskCreatePage` | Todos |
| `/tasks/:id` | `TaskDetailPage` | Todos |
| `/notifications` | `NotificationsPage` | Todos |
| `/profile` | `ProfilePage` | Todos |
| `/meetings` | `MeetingListPage` | Admin + Manager |
| `/meetings/create` | `MeetingCreatePage` | Admin + Manager |
| `/meetings/:id` | `MeetingDetailPage` | Admin + Manager |
| `/claim-workers` | `ClaimWorkersPage` | Manager |
| `/areas` | `AreaListPage` | Admin |
| `/areas/create` | `AreaCreatePage` | Admin |
| `/areas/:id` | `AreaDetailPage` | Admin |
| `/users` | `UserListPage` | Admin |
| `/consolidated` | `ConsolidatedPage` | Admin |
| `/attachments` | `AttachmentsPage` | Admin |
| `/settings` | `SettingsPage` | SuperAdmin |

## Grupos de Roles

```typescript
const ADMIN_ROLES   = ['superadmin', 'gerente']
const MANAGER_ROLES = ['area_manager', 'director', 'leader', 'coordinator']
const WORKER_ROLES  = ['worker', 'analyst']
```

## Redirecciones

| Origen | Destino | Condición |
|---|---|---|
| `/` | `/dashboard` | Siempre |
| Ruta no encontrada | `/dashboard` | Catch-all |
| Cualquier ruta protegida | `/login` | Usuario no autenticado |
| `/login` | `/dashboard` | Usuario ya autenticado |
| Ruta restringida por rol | `/dashboard` | Rol no permitido |

## Layout

Todas las rutas protegidas se renderizan dentro de `AppLayout`, que provee:
- **Sidebar** con navegación filtrada por rol
- **Header** con menú móvil y campana de notificaciones
- **Content area** donde se renderizan las páginas

### Menú de Navegación por Rol

| Elemento | Icono | Ruta | Roles |
|---|---|---|---|
| Dashboard | `HiChartPie` | `/dashboard` | Todos |
| Tareas | `HiClipboardList` | `/tasks` | Todos |
| Áreas | `HiOfficeBuilding` | `/areas` | Admin |
| Mi equipo | `HiUserGroup` | `/claim-workers` | Manager |
| Reuniones | `HiCalendar` | `/meetings` | Admin + Manager |
| Usuarios | `HiUsers` | `/users` | Admin |
| Consolidado | `HiDocumentReport` | `/consolidated` | Admin |
| Configuración | `HiCog` | `/settings` | SuperAdmin |
