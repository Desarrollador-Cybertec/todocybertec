# Control de Acceso Basado en Roles (RBAC)

## Roles del Sistema

| Slug | Etiqueta | Grupo |
|---|---|---|
| `superadmin` | SuperAdmin | Admin |
| `gerente` | Gerente | Admin |
| `area_manager` | Jefe de Área | Manager |
| `director` | Director | Manager |
| `leader` | Líder | Manager |
| `coordinator` | Coordinador | Manager |
| `worker` | Trabajador | Worker |
| `analyst` | Analista | Worker |

## Agrupaciones

```typescript
const ADMIN_ROLES   = ['superadmin', 'gerente']
const MANAGER_ROLES = ['area_manager', 'director', 'leader', 'coordinator']
const WORKER_ROLES  = ['worker', 'analyst']
```

---

## Permisos por Funcionalidad

### Navegación / Menú

| Función | Admin | Manager | Worker |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Tareas | ✅ | ✅ | ✅ |
| Áreas | ✅ | ❌ | ❌ |
| Mi equipo (Claim workers) | ❌ | ✅ | ❌ |
| Reuniones | ✅ | ✅ | ❌ |
| Usuarios | ✅ | ❌ | ❌ |
| Consolidado | ✅ | ❌ | ❌ |
| Adjuntos | ✅ | ❌ | ❌ |
| Configuración | Solo superadmin | ❌ | ❌ |
| Notificaciones | ✅ | ✅ | ✅ |
| Perfil | ✅ | ✅ | ✅ |

### Dashboard

| Vista | Roles |
|---|---|
| SuperAdminDashboard (general) | `superadmin`, `gerente` |
| ManagerDashboardView (área) | `area_manager`, `director`, `leader`, `coordinator` |
| PersonalDashboardView | `worker`, `analyst` |

### Tareas

| Acción | Admin | Manager | Worker |
|---|---|---|---|
| Ver listado | ✅ | ✅ | ✅ |
| Crear tarea organizacional | ✅ | ✅ | ❌ |
| Crear tarea personal | ✅ | ✅ | ✅ |
| Editar tarea | ✅ | ✅ (si es participante) | ❌ |
| Eliminar tarea | ✅ | ❌ | ❌ |
| Delegar tarea | ✅ | ✅ (si es responsable) | ❌ |
| Iniciar tarea | ✅ | ✅ | ✅ (si es responsable) |
| Enviar a revisión | ✅ | ✅ | ✅ (si es responsable) |
| Aprobar tarea | ✅ | ✅ (si es manager del área) | ❌ |
| Rechazar tarea | ✅ | ✅ (si es manager del área) | ❌ |
| Completar tarea | ✅ | ✅ | ✅ (si es responsable) |
| Cancelar tarea | ✅ | ✅ | ❌ |
| Reabrir tarea | ✅ | ✅ | ❌ |
| Subir adjuntos | ✅ | ✅ | ✅ (si es participante) |
| Comentar | ✅ | ✅ | ✅ (si es participante) |
| Reclamar tarea | ❌ | ❌ | ✅ (tareas de su área) |

### Reuniones

| Acción | Admin | Manager | Worker |
|---|---|---|---|
| Listar | ✅ | ✅ | ❌ |
| Crear | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ❌ |
| Cerrar | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ❌ | ❌ |

### Áreas

| Acción | Admin | Manager | Worker |
|---|---|---|---|
| Listar | ✅ | ❌ | ❌ |
| Crear | ✅ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ |
| Asignar manager | ✅ | ❌ | ❌ |
| Reclamar trabajador | ❌ | ✅ | ❌ |
| Remover miembro | ✅ | ✅ | ❌ |

### Usuarios

| Acción | Admin | Manager | Worker |
|---|---|---|---|
| Listar | ✅ | ❌ | ❌ |
| Crear | ✅ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ |
| Cambiar rol | ✅ | ❌ | ❌ |
| Activar/desactivar | ✅ | ❌ | ❌ |
| Cambiar contraseña | ✅ | ❌ | ❌ |

### Configuración

| Acción | SuperAdmin | Gerente | Otros |
|---|---|---|---|
| Ver configuración | ✅ | ❌ | ❌ |
| Editar settings | ✅ | ❌ | ❌ |
| Editar plantillas | ✅ | ❌ | ❌ |
| Gestionar roles | ✅ | ❌ | ❌ |
| Ejecutar automatización | ✅ | ❌ | ❌ |
| Importar datos | ✅ | ❌ | ❌ |

---

## Implementación Técnica

### Nivel de Ruta

Las rutas se protegen con `ProtectedRoute`:

```tsx
<Route element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]} />}>
  <Route path="/areas" element={<AreaListPage />} />
</Route>
```

### Nivel de UI (Menú)

El sidebar filtra elementos de navegación según el rol del usuario:

```typescript
const navItems = [
  { label: 'Dashboard',     path: '/dashboard',    roles: 'all' },
  { label: 'Áreas',         path: '/areas',         roles: ADMIN_ROLES },
  { label: 'Mi equipo',     path: '/claim-workers', roles: MANAGER_ROLES },
  { label: 'Configuración', path: '/settings',      roles: ['superadmin'] },
  // ...
]
```

### Nivel de Componente (Permisos de Tarea)

El hook `useTaskPermissions` determina acciones disponibles:

```typescript
const perms = useTaskPermissions(task, user)

// perms.canEdit → ¿puede editar la tarea?
// perms.canDelegate → ¿puede delegar?
// perms.canDelete → ¿puede eliminar?
// perms.canUpload → ¿puede subir adjuntos?
// perms.canComment → ¿puede comentar?
```

**Factores evaluados:**
1. Rol del usuario (admin/manager/worker)
2. Estado de la tarea (activa, completada, cancelada)
3. Relación del usuario con la tarea (creador, responsable, asignado)
4. Tipo de tarea (organizacional vs personal)
5. Asignación de la tarea (a usuario, a área, a externo)

---

## Tipos de Tarea

### Organizacional
- Creada por admin o manager
- Asignada a un usuario, área o email externo
- Visible en el dashboard general y de área
- Requiere aprobación de manager (configurable)

### Personal
- Creada por un worker para sí mismo
- Sin asignación externa
- Visible solo en el dashboard personal
- No requiere aprobación
