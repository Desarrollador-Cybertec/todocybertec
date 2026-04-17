# Esquemas de Validación (Zod)

Todos los esquemas se encuentran en `src/schemas/` y se re-exportan desde `src/schemas/index.ts`.  
Se integran con **React Hook Form** mediante `@hookform/resolvers/zod`.

---

## Login — `src/schemas/auth.schema.ts`

```typescript
const loginSchema = z.object({
  email: z.string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido'),
  password: z.string()
    .min(1, 'La contraseña es obligatoria'),
})

type LoginFormData = z.infer<typeof loginSchema>
```

---

## Tareas — `src/schemas/task.schema.ts`

### Crear Tarea

```typescript
const createTaskSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(255),
  description: z.string().max(5000).optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().optional().or(z.literal('')),
  start_date: z.string().optional().or(z.literal('')),
  assigned_to_user_id: z.number().optional().nullable(),
  assigned_to_area_id: z.number().optional().nullable(),
  external_email: z.string().email().optional().or(z.literal('')),
  external_name: z.string().max(255).optional().or(z.literal('')),
  meeting_id: z.number().optional().nullable(),

  // Flags de requisitos (booleanos con valor por defecto)
  requires_attachment: z.boolean().default(false),
  requires_completion_comment: z.boolean().default(false),
  requires_manager_approval: z.boolean().default(true),
  requires_completion_notification: z.boolean().default(true),
  requires_due_date: z.boolean().default(false),
  requires_progress_report: z.boolean().default(false),
  notify_on_due: z.boolean().default(true),
  notify_on_overdue: z.boolean().default(true),
  notify_on_completion: z.boolean().default(true),
})

type CreateTaskFormData = z.infer<typeof createTaskSchema>
```

### Delegar Tarea

```typescript
const delegateTaskSchema = z.object({
  to_user_id: z.number().positive('Selecciona un trabajador'),
  note: z.string().max(2000).optional().or(z.literal('')),
})

type DelegateTaskFormData = z.infer<typeof delegateTaskSchema>
```

### Aprobar Tarea

```typescript
const approveTaskSchema = z.object({
  note: z.string().min(1, 'La nota es obligatoria').max(2000),
})

type ApproveTaskFormData = z.infer<typeof approveTaskSchema>
```

### Rechazar Tarea

```typescript
const rejectTaskSchema = z.object({
  note: z.string().min(1, 'El motivo es obligatorio').max(2000),
})

type RejectTaskFormData = z.infer<typeof rejectTaskSchema>
```

### Agregar Comentario

```typescript
const addCommentSchema = z.object({
  comment: z.string().min(1, 'El comentario es obligatorio').max(2000),
})

type AddCommentFormData = z.infer<typeof addCommentSchema>
```

---

## Usuarios — `src/schemas/user.schema.ts`

### Reglas de Contraseña

```typescript
const passwordRules = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial')
```

### Crear Usuario

```typescript
const createUserSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  email: z.string().email('Email inválido'),
  password: passwordRules,
  password_confirmation: z.string(),
  role_id: z.number().positive('Selecciona un rol'),
  area_id: z.number().optional().nullable(),
}).refine(
  (data) => data.password === data.password_confirmation,
  { message: 'Las contraseñas no coinciden', path: ['password_confirmation'] }
)

type CreateUserFormData = z.infer<typeof createUserSchema>
```

### Actualizar Usuario

```typescript
const updateUserSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  password: passwordRules.optional().or(z.literal('')),
  password_confirmation: z.string().optional().or(z.literal('')),
}).refine(
  (data) => !data.password || data.password === data.password_confirmation,
  { message: 'Las contraseñas no coinciden', path: ['password_confirmation'] }
)

type UpdateUserFormData = z.infer<typeof updateUserSchema>
```

---

## Áreas — `src/schemas/area.schema.ts`

### Crear Área

```typescript
const createAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  process_identifier: z.string().max(100).optional().or(z.literal('')),
  manager_user_id: z.number().optional().nullable(),
  icon_key: z.string().optional(),
})

type CreateAreaFormData = z.infer<typeof createAreaSchema>
```

### Actualizar Área

```typescript
const updateAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  process_identifier: z.string().max(100).optional().or(z.literal('')),
  active: z.boolean().optional(),
  icon_key: z.string().optional(),
})

type UpdateAreaFormData = z.infer<typeof updateAreaSchema>
```

---

## Reuniones — `src/schemas/meeting.schema.ts`

### Crear/Actualizar Reunión

```typescript
const createMeetingSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(255),
  meeting_date: z.string().min(1, 'La fecha es obligatoria'),
  area_id: z.number().optional().nullable(),
  classification: z.enum([
    'strategic', 'operational', 'follow_up', 'review', 'other'
  ]),
  notes: z.string().max(5000).optional().or(z.literal('')),
})

type CreateMeetingFormData = z.infer<typeof createMeetingSchema>
```

---

## Patrón de Integración con React Hook Form

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema, type CreateTaskFormData } from '@/schemas'

function TaskCreatePage() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { priority: 'medium' },
  })

  const onSubmit = async (data: CreateTaskFormData) => {
    await tasksApi.create(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      {/* ... */}
    </form>
  )
}
```
