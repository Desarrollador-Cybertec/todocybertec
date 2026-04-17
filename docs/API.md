# Capa de API

## Cliente HTTP Base

**Archivo:** `src/api/client.ts`

### Configuración

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
```

### Autenticación
- Token almacenado en `sessionStorage` con clave `auth_token`
- Se agrega automáticamente como header `Authorization: Bearer {token}`
- Respuestas **401** redirigen a `/login` y limpian el token

### Manejo de Respuestas
- Desempaquetado automático de respuestas Laravel: si la respuesta tiene estructura `{ data: T }` (sin campo `token`), devuelve `T` directamente
- `204 No Content` devuelve `undefined`
- Soporte para `FormData` (sin header `Content-Type` para uploads)

### Manejo de Errores
- Lanza `ApiError` con `status` y `data`
- Detecta errores de licencia: `license_denied`, `license_expired`, `license_suspended`, `license_unavailable`

### Tipo ApiError

```typescript
class ApiError extends Error {
  status: number
  data: unknown
}
```

### Tipo ApiMessageResponse

```typescript
interface ApiMessageResponse {
  message: string
}
```

---

## Módulos de API

### Auth — `src/api/auth.ts`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `login(credentials)` | `POST /login` | `LoginRequest` | `LoginResponse` |
| `logout()` | `POST /logout` | — | `void` |
| `me()` | `GET /me` | — | `{ user: User }` |

---

### Tasks — `src/api/tasks.ts`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `list(params?)` | `GET /tasks?{params}` | query string | `PaginatedResponse<Task>` |
| `get(id)` | `GET /tasks/{id}` | `number` | `Task` |
| `create(data)` | `POST /tasks` | `CreateTaskRequest` | `Task` |
| `update(id, data)` | `PUT /tasks/{id}` | `UpdateTaskRequest` | `Task` |
| `delegate(id, data)` | `POST /tasks/{id}/delegate` | `DelegateTaskRequest` | `Task` |
| `start(id, data)` | `POST /tasks/{id}/start` | `{ comment: string }` | `Task` |
| `submitReview(id, data)` | `POST /tasks/{id}/submit-review` | `{ comment: string }` | `Task` |
| `approve(id, data)` | `POST /tasks/{id}/approve` | `{ note: string }` | `Task` |
| `reject(id, data)` | `POST /tasks/{id}/reject` | `RejectTaskRequest` | `Task` |
| `cancel(id, data)` | `POST /tasks/{id}/cancel` | `{ comment: string }` | `Task` |
| `reopen(id, data)` | `POST /tasks/{id}/reopen` | `{ comment: string }` | `Task` |
| `complete(id, data)` | `POST /tasks/{id}/complete` | `{ comment: string }` | `Task` |
| `addComment(id, data)` | `POST /tasks/{id}/comments` | `AddCommentRequest` | `TaskComment` |
| `uploadAttachment(id, formData)` | `POST /tasks/{id}/attachments` | `FormData` | `TaskAttachment` |
| `addUpdate(id, data)` | `POST /tasks/{id}/updates` | `AddUpdateRequest` | `TaskUpdate` |
| `claim(id)` | `POST /tasks/{id}/claim` | — | `Task` |
| `delete(id)` | `DELETE /tasks/{id}` | — | `ApiMessageResponse` |

---

### Meetings — `src/api/meetings.ts`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `list(params?)` | `GET /meetings` | `{ area_id?, classification? }` | `Meeting[]` |
| `get(id)` | `GET /meetings/{id}` | `number` | `Meeting` |
| `create(data)` | `POST /meetings` | `CreateMeetingRequest` | `Meeting` |
| `update(id, data)` | `PUT /meetings/{id}` | `UpdateMeetingRequest` | `Meeting` |
| `close(id)` | `POST /meetings/{id}/close` | — | `Meeting` |
| `delete(id)` | `DELETE /meetings/{id}` | — | `ApiMessageResponse` |

---

### Areas — `src/api/areas.ts`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `list(page?, active?)` | `GET /areas?page=&active=` | paginación + filtro | `PaginatedResponse<Area>` |
| `listAll()` | `GET /areas` (todas las páginas) | — | `Area[]` |
| `get(id)` | `GET /areas/{id}` | `number` | `Area` |
| `create(data)` | `POST /areas` | `CreateAreaRequest` | `Area` |
| `update(id, data)` | `PUT /areas/{id}` | `UpdateAreaRequest` | `Area` |
| `assignManager(id, managerUserId)` | `POST /areas/{id}/assign-manager` | `number` | `Area` |
| `members(id, page?, search?)` | `GET /areas/{id}/members` | paginación + búsqueda | `PaginatedResponse<User>` |
| `membersAll(id)` | `GET /areas/{id}/members` (todas) | — | `User[]` |
| `availableWorkers(id, page?, search?)` | `GET /areas/{id}/available-workers` | paginación + búsqueda | `PaginatedResponse<User>` |
| `claimWorker(data)` | `POST /areas/claim-worker` | `ClaimWorkerRequest` | `ClaimWorkerResponse` |
| `removeMember(areaId, userId)` | `DELETE /areas/{areaId}/members/{userId}` | — | `ApiMessageResponse` |
| `delete(id)` | `DELETE /areas/{id}` | — | `ApiMessageResponse` |

---

### Users — `src/api/users.ts`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `list(page?, role?)` | `GET /users?page=&role=` | paginación + filtro | `PaginatedResponse<User>` |
| `listAll()` | `GET /users` (todas las páginas) | — | `User[]` |
| `get(id)` | `GET /users/{id}` | `number` | `User` |
| `create(data)` | `POST /users` | `CreateUserRequest` | `User` |
| `update(id, data)` | `PUT /users/{id}` | `UpdateUserRequest` | `User` |
| `changeRole(id, roleId)` | `PUT /users/{id}/change-role` | `number` | `ApiMessageResponse` |
| `toggleActive(id)` | `PUT /users/{id}/toggle-active` | — | `ApiMessageResponse` |
| `changePassword(id, data)` | `PUT /users/{id}/change-password` | `{ password, password_confirmation }` | `ApiMessageResponse` |

---

### Roles — `src/api/roles.ts`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `list()` | `GET /roles` | — | `RoleInfo[]` |
| `toggleActive(id)` | `PUT /roles/{id}/toggle-active` | — | `ToggleRoleResponse` |

---

### Dashboard — `src/api/dashboard.ts`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `general()` | `GET /dashboard` | — | `GeneralDashboard` |
| `area(id)` | `GET /dashboard/area/{id}` | `number` | `AreaDashboard` |
| `consolidated(params?)` | `GET /dashboard/consolidated` | `{ date_from?, date_to? }` | `ConsolidatedDashboard` |
| `personal()` | `GET /dashboard/personal` | — | `PersonalDashboard` |

---

### Notifications — `src/api/notifications.ts`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `list(page?)` | `GET /notifications?page=` | paginación | `NotificationPaginatedResponse` |
| `getUnreadCount()` | `GET /notifications/unread-count` | — | `NotificationUnreadCountResponse` |
| `markAsRead(id)` | `POST /notifications/{id}/read` | `string` | `Notification` |
| `markAllAsRead()` | `POST /notifications/read-all` | — | `{ message: string }` |

---

### Settings — `src/api/settings.ts`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `listSettings(group?)` | `GET /settings?group=` | filtro | `SystemSetting[]` |
| `updateSettings(settings)` | `PUT /settings` | `{ key, value }[]` | `ApiMessageResponse` |
| `listTemplates()` | `GET /message-templates` | — | `MessageTemplate[]` |
| `updateTemplate(id, data)` | `PUT /message-templates/{id}` | `UpdateMessageTemplateRequest` | `MessageTemplate` |

#### Automatización

| Método | Endpoint | Retorna |
|---|---|---|
| `automationApi.detectOverdue()` | `POST /automation/detect-overdue` | `ApiMessageResponse` |
| `automationApi.sendDailySummary()` | `POST /automation/daily-summary` | `ApiMessageResponse` |
| `automationApi.sendDueReminders()` | `POST /automation/due-reminders` | `ApiMessageResponse` |
| `automationApi.detectInactive()` | `POST /automation/detect-inactive` | `ApiMessageResponse` |

#### Importación

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `importApi.importTasks(file)` | `POST /import/tasks` | `File` (FormData) | `ApiMessageResponse` |

---

### Attachments — `src/api/attachments.ts`

| Método | Endpoint | Parámetros | Retorna |
|---|---|---|---|
| `upload(formData)` | `POST /attachments` | `FormData` | `Attachment` |
| `listByTask(taskId, params?)` | `GET /attachments?task_id={id}&{params}` | query | `PaginatedResponse<Attachment>` |
| `listByArea(areaId, params?)` | `GET /attachments?area_id={id}&{params}` | query | `PaginatedResponse<Attachment>` |
| `getSignedUrl(id, download?)` | `GET /attachments/{id}/signed-url` | `boolean` | `AttachmentSignedUrl` |
| `delete(id)` | `DELETE /attachments/{id}` | — | `ApiMessageResponse` |
