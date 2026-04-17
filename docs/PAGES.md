# Páginas de la Aplicación

Cada página corresponde a una ruta definida en `App.tsx`. Se organizan por dominio funcional en `src/pages/`.

---

## Auth — `src/pages/auth/`

### LoginPage

**Ruta:** `/login`  
**Acceso:** Solo usuarios no autenticados

Formulario de inicio de sesión con:
- Campos: email y contraseña
- Validación Zod (`loginSchema`)
- Manejo de errores:
  - **422**: Errores de validación del backend
  - **Licencia**: `license_expired`, `license_suspended`, `license_unavailable`
- Animación de entrada con Framer Motion
- Fondo con patrón dot-grid
- Logo S!NTyC (isotipo)

---

## Dashboard — `src/pages/dashboard/`

### DashboardPage

**Ruta:** `/dashboard`  
**Acceso:** Todos los autenticados

Selecciona la vista de dashboard según el rol del usuario:

| Rol | Vista |
|---|---|
| `superadmin`, `gerente` | `SuperAdminDashboard` |
| `area_manager`, `director`, `leader`, `coordinator` | `ManagerDashboardView` |
| `worker`, `analyst` | `PersonalDashboardView` |

### SuperAdminDashboard

**API:** `dashboardApi.general()`

Métricas mostradas:
- Total de tareas (activas, completadas, canceladas)
- Tareas vencidas y próximas a vencer
- Tasa de completitud y progreso global
- Tareas completadas este mes
- Distribución por estado (tabla/gráfico)
- Distribución por área
- Carga pendiente por usuario

### ManagerDashboardView

**API:** `dashboardApi.area(areaId)`

Métricas del área:
- Tareas totales, activas, completadas
- Tareas vencidas y próximas
- Tareas sin progreso
- Tareas esperando asignación
- Carga por responsable
- Tareas esperando claim

### PersonalDashboardView

**API:** `dashboardApi.personal()`

Métricas personales:
- Tareas activas, vencidas, próximas
- Tareas completadas
- Distribución por estado
- Próximas tareas con fechas

---

## Tareas — `src/pages/tasks/`

### TaskListPage

**Ruta:** `/tasks`  
**Acceso:** Todos los autenticados

**Funcionalidades:**
- Lista de tareas con paginación
- Filtros: estado, prioridad, área, rango de fechas
- Búsqueda por título, responsable o nombre de área
- Ordenamiento configurable
- Filtro de tipo: organizacional vs personal
- Botón de crear nueva tarea
- Badges de estado y prioridad con colores
- Fecha de vencimiento con formato relativo
- Barra de progreso por tarea
- Botón de editar (admin/manager)
- Loading skeleton

### TaskCreatePage

**Ruta:** `/tasks/create`  
**Acceso:** Todos los autenticados

**Funcionalidades:**
- Formulario en dos niveles: básico y avanzado
- Vista previa en vivo de la tarea
- Asignación mutuamente excluyente: usuario, área o email externo
- 10 flags de requisitos configurables
- 3 flags de notificación
- Fecha de inicio predeterminada: hoy
- Selector de prioridad con vista previa de color
- Selector de reunión asociada
- Guardia de navegación (confirmación al salir sin guardar)
- Permisos: workers solo crean tareas personales

**Componentes internos:**
- `TaskCreateAdvanced` — Opciones avanzadas
- `TaskCreatePreview` — Vista previa en vivo

### TaskDetailPage

**Ruta:** `/tasks/:id`  
**Acceso:** Todos los autenticados

**Funcionalidades:**
- Carga la tarea al montar
- Formulario de edición (slide down)
- Acciones según permisos:
  - Iniciar, enviar a revisión, aprobar, rechazar
  - Completar, cancelar, reabrir
  - Delegar a otro usuario
- Subir adjuntos
- Historial de estados (timeline)
- Actualizaciones de la tarea
- Sección de comentarios
- Lista de adjuntos con preview
- Eliminar con modal de confirmación

**Custom Hook: `useTaskPermissions`**

```typescript
useTaskPermissions(task, user) → {
  isSuperAdmin, isManager, isWorker,
  uid, isResponsible, isCreator, isActive,
  canDelete, canDelegate, canEdit, canUpload,
  canComment, isParticipant
}
```

**Componentes internos:**
- `TaskEditForm` — Formulario de edición
- `TaskActionForms` — Formularios de acciones
- `TaskComments` — Comentarios
- `TaskAttachmentsV2` — Adjuntos
- `TaskStatusHistory` — Timeline de estados
- `TaskUpdates` — Historial de actualizaciones

---

## Reuniones — `src/pages/meetings/`

### MeetingListPage

**Ruta:** `/meetings`  
**Acceso:** Admin + Manager

**Funcionalidades:**
- Tarjetas de reuniones
- Filtro por clasificación
- Filtro por rango de fechas
- Badge de clasificación con colores
- Conteo de tareas por reunión
- Indicador de reunión cerrada

### MeetingCreatePage

**Ruta:** `/meetings/create`  
**Acceso:** Admin + Manager

**Funcionalidades:**
- Formulario con validación Zod
- Selector de clasificación
- Selector de área (opcional)
- Selector de fecha
- Campo de notas

### MeetingDetailPage

**Ruta:** `/meetings/:id`  
**Acceso:** Admin + Manager

**Funcionalidades:**
- Información de la reunión
- Sección de tareas asociadas
- Formulario para crear tareas rápidas (`MeetingDraftTaskForm`)
- Opción de cerrar la reunión
- Editar reunión
- Eliminar reunión

**Componentes internos:**
- `MeetingTasksSection` — Tareas de la reunión
- `MeetingDraftTaskForm` — Formulario rápido de tareas

---

## Áreas — `src/pages/areas/`

### AreaListPage

**Ruta:** `/areas`  
**Acceso:** Admin

**Funcionalidades:**
- Grid de tarjetas de áreas
- Modal de edición (nombre, descripción, identificador, icono)
- Eliminar con confirmación
- Selector de iconos
- Conteo de miembros
- Nombre del manager
- Bloqueo por licencia para crear áreas

### AreaCreatePage

**Ruta:** `/areas/create`  
**Acceso:** Admin

**Funcionalidades:**
- Formulario de creación
- Selector de iconos para el área
- Asignación de manager
- Descripción e identificador de proceso

### AreaDetailPage

**Ruta:** `/areas/:id`  
**Acceso:** Admin

**Funcionalidades:**
- Información del área
- Dashboard con métricas del área
- Lista de miembros del equipo
- Trabajadores disponibles para reclamar
- Sección de tareas del área

**Componentes internos:**
- `AreaInfoSection` — Detalles del área
- `AreaTasksSection` — Tareas del área
- `TeamMembersSection` — Miembros
- `AvailableWorkersSection` — Workers disponibles

### ClaimWorkersPage

**Ruta:** `/claim-workers`  
**Acceso:** Manager

Permite a los managers reclamar trabajadores para sus áreas.

---

## Usuarios — `src/pages/users/`

### UserListPage

**Ruta:** `/users`  
**Acceso:** Admin

**Funcionalidades:**
- Lista paginada de usuarios (10 por página)
- Filtro por rol
- Modal de creación de usuario
- Modal de edición (nombre, contraseña, rol, área, activo/inactivo)
- Badges de rol con colores
- Badge activo/inactivo
- Eliminar con confirmación
- Cambio de contraseña con confirmación
- Bloqueo por licencia para crear usuarios

**Componentes internos:**
- `UserCreateForm` — Formulario de creación
- `UserEditModal` — Modal de edición

---

## Configuración — `src/pages/settings/`

### SettingsPage

**Ruta:** `/settings`  
**Acceso:** SuperAdmin

**5 tabs:**

| Tab | Descripción |
|---|---|
| **Configuración** | Parámetros del sistema (clave-valor) |
| **Plantillas** | Plantillas de mensajes de correo |
| **Roles** | Gestión de roles (activar/desactivar) |
| **Automatización** | Disparar tareas automatizadas |
| **Importación** | Importar tareas desde CSV/Excel |

**Componentes internos:**
- `SettingsTab` — Configuraciones del sistema
- `TemplatesTab` — Plantillas de mensajes
- `RolesTab` — Gestión de roles
- `AutomationTab` — Automatización
- `ImportTab` — Importación de datos

---

## Perfil — `src/pages/profile/`

### ProfilePage

**Ruta:** `/profile`  
**Acceso:** Todos los autenticados

**Funcionalidades:**
- Mostrar información del usuario actual
- Editar nombre
- Cambiar contraseña
- Mensajes de éxito/error

---

## Notificaciones — `src/pages/notifications/`

### NotificationsPage

**Ruta:** `/notifications`  
**Acceso:** Todos los autenticados

**Funcionalidades:**
- Tabs de filtro: Todas, Organización, Personal
- Lista completa de notificaciones
- Click para navegar a la tarea
- Marcar como leída
- Paginación

---

## Consolidado — `src/pages/consolidated/`

### ConsolidatedPage

**Ruta:** `/consolidated`  
**Acceso:** Admin

**Funcionalidades:**
- Filtro por rango de fechas
- Resumen: total, completadas, activas, vencidas, tasa de completitud
- Desglose por área en tabla
- Icono de área
- Tasa de completitud por área
- Conteo de vencidas por área

---

## Adjuntos — `src/pages/attachments/`

### AttachmentsPage

**Ruta:** `/attachments`  
**Acceso:** Admin

**Funcionalidades:**
- Selector de área
- Lista paginada de adjuntos
- Modal de preview
- Descarga con URL firmada
- Eliminar con confirmación
- Icono según tipo de archivo (imagen vs documento)
- Tamaño del archivo
