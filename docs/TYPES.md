# Definiciones de Tipos TypeScript

Todas las interfaces y tipos se encuentran en `src/types/` y se re-exportan desde `src/types/index.ts`.

---

## Enums y Constantes — `src/types/enums.ts`

### Estados de Tarea

```typescript
const TaskStatus = {
  DRAFT: 'draft',
  PENDING_ASSIGNMENT: 'pending_assignment',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue',
} as const

type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus]
```

### Prioridades

```typescript
const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority]
```

### Roles

```typescript
const Role = {
  SUPERADMIN: 'superadmin',
  GERENTE: 'gerente',
  AREA_MANAGER: 'area_manager',
  DIRECTOR: 'director',
  LEADER: 'leader',
  COORDINATOR: 'coordinator',
  WORKER: 'worker',
  ANALYST: 'analyst',
} as const

type RoleType = typeof Role[keyof typeof Role]
```

### Agrupaciones de Roles

```typescript
const ADMIN_ROLES   = [Role.SUPERADMIN, Role.GERENTE]         // Administradores
const MANAGER_ROLES = [Role.AREA_MANAGER, Role.DIRECTOR,      // Gestores de área
                       Role.LEADER, Role.COORDINATOR]
const WORKER_ROLES  = [Role.WORKER, Role.ANALYST]             // Trabajadores
```

### Tipos de Comentario

```typescript
const CommentType = {
  COMMENT: 'comment',
  PROGRESS: 'progress',
  COMPLETION_NOTE: 'completion_note',
  REJECTION_NOTE: 'rejection_note',
  CANCELLATION_NOTE: 'cancellation_note',
  REOPEN_NOTE: 'reopen_note',
  SYSTEM: 'system',
} as const
```

### Tipos de Adjunto

```typescript
const AttachmentType = {
  EVIDENCE: 'evidence',
  SUPPORT: 'support',
  FINAL_DELIVERY: 'final_delivery',
} as const
```

### Tipos de Actualización

```typescript
const UpdateType = {
  PROGRESS: 'progress',
  EVIDENCE: 'evidence',
  NOTE: 'note',
} as const
```

### Clasificación de Reuniones

```typescript
const MeetingClassification = {
  STRATEGIC: 'strategic',
  OPERATIONAL: 'operational',
  FOLLOW_UP: 'follow_up',
  REVIEW: 'review',
  OTHER: 'other',
} as const
```

### Etiquetas (Labels)

```typescript
TASK_STATUS_LABELS: Record<TaskStatusType, string>
// draft → 'Borrador', pending → 'Pendiente', in_progress → 'En progreso', etc.

TASK_PRIORITY_LABELS: Record<TaskPriorityType, string>
// low → 'Baja', medium → 'Media', high → 'Alta', urgent → 'Urgente'

ROLE_LABELS: Record<RoleType, string>
// superadmin → 'SuperAdmin', gerente → 'Gerente', area_manager → 'Jefe de área', etc.

MEETING_CLASSIFICATION_LABELS: Record<MeetingClassificationType, string>
// strategic → 'Estratégica', operational → 'Operativa', etc.
```

---

## Autenticación — `src/types/auth.ts`

```typescript
interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

---

## Usuario — `src/types/user.ts`

```typescript
interface UserRole {
  id: number
  name: string
  slug: RoleType
}

interface User {
  id: number
  name: string
  email: string
  active: boolean
  role_id: number
  role: UserRole
  area_id?: number | null
  created_at: string
  updated_at: string
}

interface CreateUserRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
  role_id: number
  area_id?: number | null
}

interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
}
```

---

## Tarea — `src/types/task.ts`

### Entidad Principal

```typescript
interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatusType
  priority: TaskPriorityType
  due_date: string | null
  start_date: string | null
  progress_percent: number

  // Flags de requisitos
  requires_attachment: boolean
  requires_completion_comment: boolean
  requires_manager_approval: boolean
  requires_completion_notification: boolean
  requires_due_date: boolean
  requires_progress_report: boolean

  // Flags de notificación
  notify_on_due: boolean
  notify_on_overdue: boolean
  notify_on_completion: boolean

  // Relaciones de asignación
  meeting_id: number | null
  assigned_to_user_id: number | null
  assigned_to_area_id: number | null
  current_responsible_user_id: number | null
  area_id: number | null
  external_email: string | null
  external_name: string | null

  // Auditoría
  created_by: number
  closed_by: number | null
  cancelled_by: number | null

  // Relaciones cargadas
  creator: User
  assigned_user: User | null
  assigned_area: Area | null
  delegator: User | null
  current_responsible: User | null
  area: Area | null
  meeting: Meeting | null
  comments: TaskComment[]
  attachments: TaskAttachment[]
  status_history: TaskStatusHistory[]
  delegations: TaskDelegation[]
  updates: TaskUpdate[]

  // Campos calculados
  age_days: number
  days_without_update: number
  is_overdue: boolean

  created_at: string
  updated_at: string
}
```

### Entidades Relacionadas

```typescript
interface TaskComment {
  id: number
  task_id: number
  user_id: number
  comment: string
  type: CommentTypeValue      // 'comment' | 'progress' | 'completion_note' | ...
  type_label?: string
  user: User
  created_at: string
}

interface TaskAttachment {
  id: number
  task_id: number
  uploaded_by: number
  file_name: string
  file_path: string
  mime_type: string
  file_size: number
  attachment_type: AttachmentTypeValue  // 'evidence' | 'support' | 'final_delivery'
  user: User
  created_at: string
}

interface TaskStatusHistory {
  id: number
  task_id: number
  changed_by: User | number | null
  from_status: TaskStatusType | null
  to_status: TaskStatusType
  note: string | null
  user: User
  responsible_user: User | null
  created_at: string
}

interface TaskDelegation {
  id: number
  task_id: number
  from_user: User
  to_user: User
  note: string | null
  created_at: string
}

interface TaskUpdate {
  id: number
  task_id: number
  user_id: number
  update_type: UpdateTypeValue  // 'progress' | 'evidence' | 'note'
  comment: string | null
  progress_percent: number | null
  user: User
  created_at: string
}
```

### Requests

```typescript
interface CreateTaskRequest {
  title: string
  description?: string
  priority: TaskPriorityType
  due_date?: string
  start_date?: string
  assigned_to_user_id?: number
  assigned_to_area_id?: number
  external_email?: string
  external_name?: string
  meeting_id?: number
  requires_attachment?: boolean
  requires_completion_comment?: boolean
  requires_manager_approval?: boolean
  requires_completion_notification?: boolean
  requires_due_date?: boolean
  requires_progress_report?: boolean
  notify_on_due?: boolean
  notify_on_overdue?: boolean
  notify_on_completion?: boolean
}

interface UpdateTaskRequest {
  title?: string
  description?: string
  priority?: TaskPriorityType
  // + todos los flags de requisitos y notificaciones
}

interface DelegateTaskRequest {
  to_user_id: number
  note?: string
}

interface AddCommentRequest {
  comment: string
  type?: 'comment' | 'progress' | 'completion_note'
}

interface AddUpdateRequest {
  update_type: UpdateTypeValue
  comment?: string
  progress_percent?: number
}
```

---

## Reunión — `src/types/meeting.ts`

```typescript
interface Meeting {
  id: number
  title: string
  meeting_date: string
  area_id: number | null
  classification: MeetingClassificationType
  notes: string | null
  created_by: number
  area: Area | null
  creator: User
  tasks?: Task[]
  is_closed: boolean
  closed_at: string | null
  tasks_count?: number
  created_at: string
  updated_at: string
}

interface CreateMeetingRequest {
  title: string
  meeting_date: string
  area_id?: number
  classification: MeetingClassificationType
  notes?: string
}

interface UpdateMeetingRequest {
  title?: string
  meeting_date?: string
  area_id?: number
  classification?: MeetingClassificationType
  notes?: string
}
```

---

## Área — `src/types/area.ts`

```typescript
interface Area {
  id: number
  name: string
  description: string | null
  process_identifier: string | null
  manager_user_id: number | null
  active: boolean
  icon_key: string | null
  manager: User | null
  members?: AreaMember[]
  members_count?: number
  created_at: string
  updated_at: string
}

interface AreaMember {
  id: number
  area_id: number
  user_id: number
  assigned_by: number | null
  claimed_by: number | null
  joined_at: string
  left_at: string | null
  is_active: boolean
  user: User
}

interface ClaimWorkerRequest {
  area_id: number
  user_id: number
}

interface ClaimWorkerResponse {
  message: string
  member: AreaMember
}

interface CreateAreaRequest {
  name: string
  description?: string
  process_identifier?: string
  manager_user_id?: number
  icon_key?: string
}

interface UpdateAreaRequest {
  name?: string
  description?: string
  process_identifier?: string
  active?: boolean
  icon_key?: string
}
```

---

## Notificación — `src/types/notification.ts`

```typescript
type NotificationType =
  | 'task_assigned'        | 'task_delegated'
  | 'task_submitted_for_review' | 'task_approved'
  | 'task_rejected'        | 'task_completed'
  | 'task_cancelled'       | 'task_reopened'
  | 'task_comment'         | 'task_due_soon'
  | 'task_overdue'         | 'inactivity_alert'
  | 'daily_summary'

type NotificationCategory = 'organizational' | 'personal' | 'summary'

interface NotificationData {
  type: NotificationType
  category: NotificationCategory
  message: string
  task_id?: number
  task_title?: string
  assigned_by?: string
  priority?: string
  due_date?: string
  tasks?: Array<{ id: number; title: string }>
}

interface Notification {
  id: string
  type: string
  data: NotificationData
  read_at: string | null
  created_at: string
}

interface NotificationPaginatedResponse {
  data: Notification[]
  meta: {
    current_page: number
    total: number
    per_page: number
    last_page?: number
  }
}

interface NotificationUnreadCountResponse {
  unread_count: number
}
```

---

## Dashboard — `src/types/dashboard.ts`

```typescript
interface GeneralDashboard {
  tasks_by_status: Record<string, number>
  tasks_by_area: AreaTaskCount[]
  total_all: number
  total_active: number
  total_completed: number
  total_cancelled?: number
  overdue_tasks: number
  due_soon: number
  completion_rate: number
  global_progress: number
  pending_by_user: PendingByUser[]
  completed_this_month: number
  my_tasks: MyTask[]
}

interface AreaDashboard {
  total_tasks: number
  active_tasks: number
  completed_tasks: number
  overdue_tasks: number
  due_soon: number
  without_progress: number
  pending_assignment_tasks: number
  completion_rate: number
  tasks_by_status: Record<string, number>
  by_responsible: ResponsibleLoad[]
  awaiting_claim: AwaitingClaimTask[]
  area: { id: number; name: string; manager_user_id: number | null }
}

interface PersonalDashboard {
  active_tasks: number
  overdue_tasks: number
  due_soon_tasks: number
  completed_tasks: number
  tasks_by_status: Record<string, number>
  upcoming_tasks: UpcomingTask[]
}

interface ConsolidatedDashboard {
  summary: {
    total_tasks: number
    total_completed: number
    total_active: number
    total_overdue: number
    global_completion_rate: number
  }
  by_area: ConsolidatedArea[]
}
```

---

## Adjuntos — `src/types/attachment.ts`

```typescript
type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed'
type VisibilityScope = 'user' | 'area' | 'task' | 'system'

interface Attachment {
  id: number
  uuid: string
  task_id: number | null
  area_id: number | null
  owner_user_id: number | null
  uploaded_by: number
  original_name: string
  mime_type: string
  extension: string
  size_original: number
  size_processed: number | null
  processing_status: ProcessingStatus
  visibility_scope: VisibilityScope
  checksum: string | null
  metadata: Record<string, unknown> | null
  uploader: Pick<User, 'id' | 'name'>
  processed_at: string | null
  uploaded_at: string | null
  created_at: string
  updated_at: string
}

interface AttachmentSignedUrl {
  url: string
  expires_at: string
}
```

---

## Configuración del Sistema — `src/types/settings.ts`

```typescript
interface SystemSetting {
  id: number
  key: string
  value: string
  type: 'string' | 'integer' | 'boolean'
  group: string
  description: string | null
  created_at: string
  updated_at: string
}

interface MessageTemplate {
  id: number
  name: string
  slug: string
  subject: string
  body: string
  active: boolean
  created_at: string
  updated_at: string
}

interface RoleInfo {
  id: number
  name: string
  slug: string
  is_active: boolean
  is_configurable: boolean
  users_count: number
}
```

---

## Licencia — `src/types/license.ts`

```typescript
type LicenseErrorType = 'license_denied' | 'license_expired' | 'license_suspended' | 'license_unavailable'
type LicenseStatus = 'active' | 'expired' | 'suspended' | null

interface LicenseState {
  status: LicenseStatus
  message: string | null
}
```

---

## Respuesta Paginada

```typescript
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
```
