# Flujos de Negocio — Detalle Operativo

Este documento describe cada flujo de negocio paso a paso, con las pantallas involucradas, los campos exactos, las acciones disponibles y los resultados esperados. Sirve como base para construir el manual de usuario por rol.

---

## 1. Autenticación

### 1.1 Iniciar sesión

**Pantalla:** `/login`

| Paso | Acción del usuario | Resultado |
|---|---|---|
| 1 | Abre la aplicación en el navegador | Se muestra la pantalla de login con logo S!NTyC |
| 2 | Ingresa su **correo electrónico** | Campo validado en tiempo real |
| 3 | Ingresa su **contraseña** | Campo oculto con puntos |
| 4 | Pulsa **"Ingresar"** | Spinner de carga en el botón |
| 5a | Credenciales correctas | Redirige al Dashboard según su rol |
| 5b | Credenciales incorrectas | Mensaje: *"Credenciales incorrectas"* |
| 5c | Licencia expirada | Banner: *"Suscripción vencida"* |
| 5d | Licencia suspendida | Banner: *"Suscripción suspendida"* |

### 1.2 Cerrar sesión

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Pulsa el botón rojo **"Cerrar sesión"** en el sidebar | Se limpia la sesión |
| 2 | — | Redirige a `/login` |

### 1.3 Sesión expirada

| Evento | Resultado |
|---|---|
| Cualquier petición devuelve error 401 | Se limpia el token y redirige a `/login` automáticamente |

---

## 2. Navegación Principal

### 2.1 Sidebar (barra lateral)

El sidebar muestra elementos de menú según el rol del usuario:

| Elemento de menú | SuperAdmin | Gerente | Manager | Worker |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Tareas | ✅ | ✅ | ✅ | ✅ |
| Áreas | ✅ | ✅ | ❌ | ❌ |
| Mi equipo | ❌ | ❌ | ✅ | ❌ |
| Reuniones | ✅ | ✅ | ✅ | ❌ |
| Usuarios | ✅ | ✅ | ❌ | ❌ |
| Consolidado | ✅ | ✅ | ❌ | ❌ |
| Configuración | ✅ | ❌ | ❌ | ❌ |

> **Nota:** "Manager" agrupa los roles `area_manager`, `director`, `leader` y `coordinator`. "Worker" agrupa `worker` y `analyst`.

### 2.2 Elementos del sidebar

- **Logo** de la aplicación (S!NTyC) en la parte superior
- **Menú de navegación** con el elemento activo resaltado
- **Tarjeta de usuario** al pie: avatar (inicial del nombre), nombre completo, etiqueta de rol, y nombre del área (si tiene)
- **Enlace a Perfil** y **botón "Cerrar sesión"**
- **Logo Insumma** al fondo

### 2.3 En dispositivos móviles

- El sidebar se oculta por defecto
- Aparece un **botón hamburguesa** en la esquina superior izquierda
- Al pulsarlo se despliega el sidebar como overlay con fondo difuminado
- Se cierra pulsando el botón **"✕"** o haciendo clic fuera

### 2.4 Campana de notificaciones

- Visible en el header del contenido (solo en móvil) y en el sidebar
- Muestra un **badge rojo** con la cantidad de notificaciones no leídas
- Al pulsar, abre un **panel desplegable** con las últimas notificaciones
- Cada notificación es clickeable y navega a la tarea relacionada

### 2.5 Banner de licencia

- Si la licencia está **expirada**: banner naranja con mensaje de advertencia
- Si la licencia está **suspendida**: banner rojo con mensaje de error
- Cuando la licencia está bloqueada, los botones de crear se deshabilitan

---

## 3. Dashboard

El dashboard cambia completamente según el rol del usuario.

### 3.1 Dashboard SuperAdmin / Gerente

**Pantalla:** `/dashboard`

#### Sección de bienvenida
- Saludo: *"Hola, [Nombre] 👋"*
- Resumen rápido: *"X tareas activas [y X vencidas]"*
- Botones de acceso rápido: **"Nueva tarea"** | **"Consolidado"**

#### Panel de resumen (columna izquierda 2/3)
Cuatro tarjetas con métricas clickeables:

| Métrica | Color | Click navega a |
|---|---|---|
| Activas | Azul | `/tasks` |
| Por revisar | Morado | `/tasks?status=in_review` |
| Completadas | Verde | `/tasks?status=completed` |
| Por vencer | Amarillo | `/tasks` (filtro próximas) |

Debajo: barra de **tasa de completitud** con porcentaje.

Métricas adicionales:
- Total históricas
- Progreso global (%)
- Completadas este mes
- Canceladas

#### Distribución por estado (columna derecha 1/3)
- Desglose de tareas por estado con barras de progreso por color

#### Carga por usuario (columna izquierda 2/3)
- Top 5 usuarios con más tareas pendientes
- Nombre + cantidad de tareas + barra de progreso
- Barra roja si el usuario tiene más de 5 tareas

#### Distribución por área (columna derecha 1/3)
- Nombre de cada área + cantidad de tareas
- Click navega al detalle del área

#### Mis tareas (columna derecha 1/3)
- Tareas asignadas directamente al superadmin/gerente
- Badge personal/organizacional
- Indicador de vencimiento
- Enlace a cada tarea y a *"Ver todas"*

#### Tips
- 3–4 consejos sobre gestión de tareas

---

### 3.2 Dashboard Manager (Jefe de área / Director / Líder / Coordinador)

**Pantalla:** `/dashboard`

#### Sección de bienvenida
- Saludo personalizado
- Resumen: *"Tu área tiene X tareas y tienes Y tareas propias activas [Z requieren atención]"*
- Botones: **"Nueva tarea"** | **"Mi equipo"** | **Notificaciones**

#### Panel de área (columna izquierda 2/3)

**Resumen del área:**
- 4 mini tarjetas: Total, Vencidas, Sin progreso, Completadas
- Barra de tasa de completitud

**Carga del equipo:**
- Lista de miembros del equipo con:
  - Nombre + cantidad de tareas
  - Barra de progreso (roja si sobrecargado)

**Desglose por estado del área:**
- Tabla con estado → cantidad → barra proporcional

#### Tareas urgentes (columna derecha 1/3)
- Tareas en progreso, vencidas, rechazadas o de alta prioridad
- Máximo 4 mostradas
- Si no hay: *"¡Todo bajo control!"*
- Cada tarea muestra:
  - Título + fecha vencimiento + badge de prioridad
  - Botones **"Ver"** y **"Resolver"**

#### Mis próximas tareas (columna derecha 1/3)
- Tareas propias activas (pendientes, por asignar, en revisión)
- Ordenadas por prioridad y luego por fecha
- Máximo 5 mostradas
- Botón **"Actualizar"** en cada una

#### Tips para managers
- 4 consejos específicos para gestión de equipos

---

### 3.3 Dashboard Personal (Worker / Analyst)

**Pantalla:** `/dashboard`

#### Sección de bienvenida
- Saludo personalizado
- Resumen: *"Tienes X tareas activas [y Y requieren atención inmediata]"*
- Botón: **"Nueva tarea"**

#### Lo importante hoy (columna izquierda 2/3)
- Encabezado: **"LO IMPORTANTE HOY"** con icono de rayo
- Subtítulo: *"Empieza por estas tareas para evitar atrasos"*
- Lista de tareas asignadas por un superior (manager/superadmin)
- Si no hay: *"¡Todo al día! No tienes tareas urgentes pendientes"*
- Cada tarea muestra:
  - Título + fecha (roja si vencida) + badge de prioridad
  - Botones **"Ver"** y **"Resolver"**

#### Resumen rápido (columna derecha 1/3)
- Grid 2×2 con mini tarjetas:
  - Activas | Vencidas | En revisión | Completadas
- Si hay tareas próximas a vencer:
  - Banner: *"Tienes X tarea(s) próxima(s) a vencer. Revisa su avance."*

#### Por iniciar (columna derecha 1/3)
- Tareas con estado `pending` o `pending_assignment`
- Máximo 4 mostradas
- Click navega al detalle de la tarea

#### Mis tareas activas (fila completa)
- Tareas con estado `in_progress`, `in_review`, `rejected`, `overdue`
- Máximo 5 mostradas
- Cada tarea: título + fecha + prioridad + badge vencida
- Botón **"Actualizar"** en cada una

#### Ayuda rápida
- 3 consejos para trabajadores

---

## 4. Gestión de Tareas

### 4.1 Crear tarea

**Pantalla:** `/tasks/create`  
**Acceso:** Todos los usuarios autenticados

#### Formulario principal (columna izquierda 2/3)

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| Título | Texto | ✅ | Máx. 255 caracteres |
| Responsable | Varía | — | Ver detalle por rol abajo |
| Fecha de vencimiento | Fecha | — | Opcional |
| Prioridad | Selector pills | ✅ | Baja / Media / Alta / Urgente |

**Asignación de responsable según rol:**

| Rol del creador | Opciones de asignación |
|---|---|
| **Worker / Analyst** | Radio: *"Para mí"* o *"Correo externo"* (email + nombre) |
| **Manager** | Dropdown de usuarios del equipo, o asignar a área, o correo externo |
| **SuperAdmin / Gerente** | Dropdown de todos los usuarios, o asignar a área, o correo externo |

#### Opciones avanzadas (colapsable)

Se despliegan al pulsar **"⚡ Configurar requisitos, notificaciones y más"**:

**Requisitos (checkboxes):**

| Requisito | Default | Disponible para |
|---|---|---|
| Requiere adjunto | ❌ | Todos |
| Requiere comentario de cierre | ❌ | Todos |
| Requiere aprobación del encargado | ✅ | Manager/Admin |
| Requiere fecha límite | ❌ | Manager/Admin |

**Notificaciones (checkboxes, solo Manager/Admin):**

| Notificación | Default |
|---|---|
| Notificar al vencer | ✅ |
| Notificar si vencida | ✅ |
| Notificar al completarse | ✅ |

**Campos adicionales:**
- Descripción (textarea, máx. 5000 caracteres)
- Área asignada (dropdown)
- Reunión asociada (dropdown)

#### Vista previa en vivo (columna derecha 1/3)

Actualiza en tiempo real mostrando:
- Título de la tarea
- Badge de prioridad con color
- Nombre del responsable
- Fecha de vencimiento
- Badges de requisitos activos

#### Flujo de envío

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Pulsa **"Crear tarea"** | Aparece modal de confirmación |
| 2 | Confirma en el modal | Spinner + creación de tarea |
| 3a | Éxito | Toast de éxito + redirige a detalle de la tarea |
| 3b | Error de validación | Mensajes de error bajo cada campo |
| 3c | Error de licencia | Toast o banner según tipo |

#### Guardia de navegación

Si el usuario ha llenado campos y trata de salir:
- Modal: *"¿Salir sin guardar?"* → **"Salir"** / **"Quedarse"**

---

### 4.2 Listar tareas

**Pantalla:** `/tasks`  
**Acceso:** Todos los usuarios autenticados

#### Encabezado

| Rol | Subtítulo |
|---|---|
| SuperAdmin | *"Crea, asigna y gestiona tareas fácilmente"* |
| Manager | *"Administra las tareas de tu equipo"* |
| Worker | *"Revisa y actualiza tus tareas asignadas"* |

Botón: **"Nueva tarea"** (esquina derecha)

#### Panel de filtros

| Filtro | Tipo | Disponible para |
|---|---|---|
| Búsqueda | Texto libre | Todos |
| Estado | Dropdown | Todos |
| Prioridad | Dropdown | Todos |
| Área | Dropdown | Solo SuperAdmin |
| Tipo (Org/Personal) | Dropdown | Manager/SuperAdmin sin filtro de área |
| Ordenar | Dropdown | Todos |
| Vence desde | Fecha | Todos |
| Vence hasta | Fecha | Todos |

**Opciones de ordenamiento:**
- Más recientes (predeterminado)
- Más antiguas
- Fecha de vencimiento
- Prioridad

**Botón "Limpiar filtros"** aparece cuando hay filtros activos.

#### Cada tarjeta de tarea muestra

| Elemento | Descripción |
|---|---|
| Título | Enlace al detalle, truncado si largo |
| Badge "Vencida" | Rojo, solo si la tarea está vencida |
| Responsable | Avatar + nombre |
| Fecha de vencimiento | Con icono de reloj, roja si vencida |
| Área | Nombre del área |
| Progreso | Barra de progreso + porcentaje |
| Badge "Adjunto obligatorio" | Si tiene requisito de adjunto |
| Badge de estado | Color según estado |
| Badge de prioridad | Color según prioridad |
| Selector de estado | Dropdown inline para cambiar estado (según permisos) |
| Botón "Ver" | Navega al detalle |
| Botón "Editar" | Solo para Manager/SuperAdmin |

#### Estados vacíos

| Condición | Mensaje | Acción |
|---|---|---|
| Sin tareas | *"Aún no hay tareas"* | Botón *"Crear primera tarea"* |
| Sin resultados con filtros | *"Sin resultados para los filtros aplicados"* | Botón *"Limpiar filtros"* |

---

### 4.3 Detalle de tarea

**Pantalla:** `/tasks/:id`  
**Acceso:** Todos los usuarios autenticados

#### Encabezado
- Botón **"← Volver a tareas"**
- Mensajes de éxito/error (animados)

#### Información principal

| Dato | Descripción |
|---|---|
| Título | H2 grande |
| Descripción | Texto descriptivo |
| Estado | Badge de color |
| Prioridad | Badge de color |
| Creado por | Avatar + nombre |
| Responsable | Avatar + nombre (o *"Sin asignar"*) |
| Área | Nombre del área (o *"Sin área"*) |
| Fecha límite | Con icono, roja si vencida |
| Avance | Barra de progreso + porcentaje |
| Antigüedad | Días desde la creación |
| Reunión de origen | Título de la reunión (si aplica) |

#### Botones de acción

Los botones visibles dependen del rol del usuario, el estado de la tarea y la relación del usuario con la tarea:

| Acción | Quién puede | Cuándo |
|---|---|---|
| **Editar** (ámbar) | Admin, Manager (si participante), Responsable | Tarea no completada ni cancelada |
| **Delegar** (gris) | Admin, Manager (si responsable), Responsable | Tarea activa |
| **Adjuntar** (gris) | Participantes de la tarea | Tarea activa |
| **Comentar** (gris) | Participantes de la tarea | Siempre |
| **Iniciar** | Responsable de la tarea | Estado `pending` |
| **Enviar a revisión** | Responsable | Estado `in_progress` + requiere aprobación |
| **Completar** | Responsable | Estado `in_progress` sin aprobación requerida |
| **Aprobar** (verde) | Manager del área / Admin | Estado `in_review` |
| **Rechazar** (rojo) | Manager del área / Admin | Estado `in_review` |
| **Cancelar** | Admin / Manager | Tarea no completada |
| **Reabrir** | Admin / Manager | Estado `completed`, `rejected` o `cancelled` |
| **Eliminar** (rojo) | Creador o SuperAdmin | Siempre |

#### Formularios de acción (se despliegan al pulsar el botón correspondiente)

**Comentar:**

| Campo | Tipo | Requerido |
|---|---|---|
| Comentario | Textarea | ✅ (máx. 2000 caracteres) |

Botones: **"Enviar"** | **"Cancelar"**

---

**Reportar avance:**

| Campo | Tipo | Requerido |
|---|---|---|
| Tipo de actualización | Dropdown: Progreso / Evidencia / Nota | ✅ |
| Porcentaje de avance | Número (0-100) | Solo si tipo = Progreso |
| Comentario | Textarea | — |

Botones: **"Reportar"** | **"Cancelar"**

---

**Aprobar:**

| Campo | Tipo | Requerido |
|---|---|---|
| Nota de aprobación | Textarea | ✅ (máx. 2000 caracteres) |

Botones: **"Aprobar"** (verde) | **"Cancelar"**

---

**Rechazar:**

| Campo | Tipo | Requerido |
|---|---|---|
| Motivo del rechazo | Textarea | ✅ (máx. 2000 caracteres) |

Botones: **"Rechazar"** (rojo) | **"Cancelar"**

---

**Delegar:**

| Campo | Tipo | Requerido |
|---|---|---|
| Trabajador destino | Dropdown de usuarios | ✅ |
| Nota | Textarea | — (máx. 2000 caracteres) |

Botones: **"Delegar"** | **"Cancelar"**

---

**Subir adjunto:**

| Campo | Tipo | Requerido |
|---|---|---|
| Tipo de adjunto | Dropdown: Evidencia / Soporte / Entrega final | ✅ |
| Archivo | File input | ✅ (máx. 10 MB) |

Formatos permitidos: `pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, gif, webp, txt, csv, zip, rar`

Botones: **"Subir"** | **"Cancelar"**

---

#### Secciones inferiores del detalle

**Adjuntos:**
- Lista de archivos adjuntos con nombre, tipo, tamaño y quién lo subió
- Botones de preview, descarga y eliminar

**Comentarios:**
- Lista cronológica con avatar, nombre, texto y fecha
- Opción de eliminar (si es autor o admin)

**Historial de estados:**
- Timeline visual de cada cambio de estado
- Quién lo hizo, cuándo, y nota asociada

**Actualizaciones:**
- Log de reportes de avance
- Tipo, comentario, porcentaje y fecha

---

### 4.4 Ciclo de vida de una tarea (diagrama de estados)

```
 ┌──────────┐
 │  draft   │ ← Tarea creada sin asignar
 └────┬─────┘
      │ asignar a área
      ▼
 ┌─────────────────────┐
 │ pending_assignment   │ ← Asignada a un área, sin responsable individual
 └──────────┬──────────┘
            │ worker reclama (claim) / admin asigna usuario
            ▼
      ┌──────────┐
      │ pending  │ ← Responsable asignado, esperando inicio
      └────┬─────┘
           │ responsable pulsa "Iniciar"
           ▼
      ┌──────────────┐
      │ in_progress  │ ← Trabajo en curso
      └──┬───────┬───┘
         │       │
         │       │ (sin aprobación requerida)
         │       └──────────────────────┐
         │ enviar a revisión            │ completar directo
         ▼                              ▼
   ┌──────────────┐            ┌──────────────┐
   │  in_review   │            │  completed   │
   └──┬───────┬───┘            └──────────────┘
      │       │                       ▲
      │       │ aprobar               │
      │       └───────────────────────┘
      │ rechazar
      ▼
   ┌──────────┐
   │ rejected │
   └──────────┘

   Desde cualquier estado activo:
   ─────────────────────────────
   cancelar → cancelled
   reabrir  → pending (desde completed / rejected / cancelled)
   
   Automático:
   ─────────
   Fecha vencida + tarea no completada → overdue (indicador visual)
```

---

### 4.5 Delegación de tarea — paso a paso

| Paso | Acción | Resultado |
|---|---|---|
| 1 | En el detalle de la tarea, pulsa **"Delegar"** | Se despliega formulario |
| 2 | Selecciona el **trabajador destino** del dropdown | — |
| 3 | Escribe una **nota** (opcional) | — |
| 4 | Pulsa **"Delegar"** | La tarea cambia de responsable |
| 5 | — | El nuevo responsable recibe notificación `task_delegated` |
| 6 | — | Se registra en el historial de delegaciones de la tarea |

---

### 4.6 Reclamar tarea (Claim) — paso a paso

Disponible para **workers** cuando la tarea está asignada a su área pero sin responsable individual.

| Paso | Acción | Resultado |
|---|---|---|
| 1 | El worker ve la tarea con estado `pending_assignment` en su listado | — |
| 2 | Abre el detalle de la tarea | Ve botón de reclamar |
| 3 | Pulsa **"Reclamar"** | Se asigna como responsable |
| 4 | — | Estado cambia a `pending` |
| 5 | — | Puede iniciar la tarea |

---

### 4.7 Flujo completo de una tarea organizacional — paso a paso

| Paso | Actor | Acción | Estado resultante |
|---|---|---|---|
| 1 | Admin/Manager | Crea tarea y la asigna a un usuario | `pending` |
| 2 | Worker | Recibe notificación `task_assigned` | — |
| 3 | Worker | Abre la tarea y pulsa **"Iniciar"** | `in_progress` |
| 4 | Worker | Sube adjuntos, reporta avances, agrega comentarios | `in_progress` |
| 5a | Worker | Pulsa **"Enviar a revisión"** (si requiere aprobación) | `in_review` |
| 5b | Worker | Pulsa **"Completar"** (si no requiere aprobación) | `completed` |
| 6 | Manager | Recibe notificación `task_submitted_for_review` | — |
| 7a | Manager | Revisa y pulsa **"Aprobar"** + escribe nota | `completed` |
| 7b | Manager | Revisa y pulsa **"Rechazar"** + escribe motivo | `rejected` |
| 8 | Worker | Recibe notificación `task_approved` o `task_rejected` | — |
| 9 | Worker | Si rechazada: corrige y repite desde paso 3 | `in_progress` |

---

### 4.8 Flujo de una tarea personal (Worker) — paso a paso

| Paso | Actor | Acción | Estado resultante |
|---|---|---|---|
| 1 | Worker | Crea tarea con opción *"Para mí"* | `pending` |
| 2 | Worker | Pulsa **"Iniciar"** | `in_progress` |
| 3 | Worker | Trabaja: sube adjuntos, reporta avances | `in_progress` |
| 4 | Worker | Pulsa **"Completar"** | `completed` |

> Las tareas personales no requieren aprobación de un manager.

---

### 4.9 Flujo de una tarea asignada a área — paso a paso

| Paso | Actor | Acción | Estado resultante |
|---|---|---|---|
| 1 | Admin/Manager | Crea tarea asignada a un **área** (sin usuario específico) | `pending_assignment` |
| 2 | — | La tarea aparece en el dashboard del área como *"esperando asignación"* | — |
| 3 | Worker del área | Ve la tarea en su listado y pulsa **"Reclamar"** | `pending` |
| 4 | Worker | Pulsa **"Iniciar"** | `in_progress` |
| 5 | — | Continúa el flujo normal (avances → revisión → completar) | — |

---

## 5. Gestión de Reuniones

### 5.1 Crear reunión — paso a paso

**Pantalla:** `/meetings/create`  
**Acceso:** SuperAdmin, Gerente, Managers

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| Título | Texto | ✅ | Máx. 255 caracteres |
| Fecha | Date input | ✅ | — |
| Clasificación | Dropdown | ✅ | Estratégica, Operativa, Seguimiento, Revisión, Otra |
| Área | Dropdown | — | Managers: área propia autoseleccionada (solo lectura) |
| Notas | Textarea | — | Máx. 5000 caracteres |

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Llena los campos del formulario | — |
| 2 | Pulsa **"Crear reunión"** | Modal de confirmación |
| 3 | Confirma | Reunión creada, redirige al detalle |

Guardia de navegación si hay datos sin guardar.

---

### 5.2 Listar reuniones

**Pantalla:** `/meetings`  
**Acceso:** SuperAdmin, Gerente, Managers

#### Filtros

| Filtro | Tipo |
|---|---|
| Clasificación | Dropdown: Todas + 5 clasificaciones |
| Fecha desde | Date input |
| Fecha hasta | Date input |

Botón **"Limpiar filtros"** si hay filtros activos.

#### Cada tarjeta muestra

- Icono de calendario con color de clasificación
- Título (enlace al detalle)
- Fecha con icono
- Badge de clasificación con color
- Badge **"Cerrada"** (rojo con candado, si aplica)
- Nombre del área
- Creador: avatar + nombre

**Clasificaciones y sus colores:**

| Clasificación | Color |
|---|---|
| Estratégica | Morado |
| Operativa | Azul |
| Seguimiento | Verde |
| Revisión | Ámbar |
| Otra | Gris |

---

### 5.3 Detalle de reunión

**Pantalla:** `/meetings/:id`

#### Información
- Título, fecha, clasificación (badge), creador, área, notas
- Si cerrada: fecha de cierre

#### Acciones

| Acción | Quién | Condición |
|---|---|---|
| **Editar** | Admin / Manager | Reunión abierta |
| **Cerrar reunión** | Admin / Manager | Reunión abierta |
| **Eliminar** | Admin | Siempre |

#### Editar reunión (formulario expandible)

| Campo | Tipo |
|---|---|
| Título | Texto |
| Fecha | Date input |
| Clasificación | Dropdown |
| Notas | Textarea |

Botones: **"Guardar"** | **"Cancelar"**

#### Compromisos (tareas de la reunión)

**Tareas existentes:**
- Lista de tareas vinculadas con título, estado, prioridad, responsable
- Click navega al detalle de la tarea

**Crear compromisos** (solo si la reunión está abierta):

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Llena el formulario rápido de tarea | — |
| 2 | Pulsa **"Agregar"** | Se añade a la lista de borradores |
| 3 | Repite pasos 1-2 para más compromisos | Se acumulan en la lista |
| 4 | Puede **editar** o **eliminar** cada borrador | — |
| 5 | Pulsa **"Crear compromisos"** | Crea todas las tareas vinculadas a la reunión |

**Formulario rápido por compromiso:**

| Campo | Tipo |
|---|---|
| Título | Texto (requerido) |
| Descripción | Textarea |
| Prioridad | Selector pills |
| Fecha de vencimiento | Date input |
| Asignado a | Dropdown (miembros del área) |
| Requisitos | Checkboxes (adjunto, comentario, aprobación, fecha) |
| Notificaciones | Checkboxes |

---

### 5.4 Cerrar reunión — paso a paso

| Paso | Acción | Resultado |
|---|---|---|
| 1 | En el detalle, pulsa **"Cerrar reunión"** | Modal de confirmación |
| 2 | Confirma | La reunión se marca como cerrada |
| 3 | — | Ya no se pueden crear compromisos nuevos |
| 4 | — | Las tareas existentes siguen su flujo normal |
| 5 | — | Se registra fecha de cierre |

---

## 6. Gestión de Áreas

### 6.1 Crear área — paso a paso

**Pantalla:** `/areas/create`  
**Acceso:** SuperAdmin, Gerente

| Campo | Tipo | Requerido |
|---|---|---|
| Nombre | Texto | ✅ (máx. 255) |
| Descripción | Textarea | — (máx. 1000) |
| Identificador de proceso | Texto | — (máx. 100) |
| Icono | Selector visual (44 iconos) | — |
| Encargado | Dropdown (managers/admins) | — |

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Llena los campos del formulario | — |
| 2 | Selecciona un icono representativo | Vista previa del icono |
| 3 | Asigna un encargado (opcional) | — |
| 4 | Pulsa **"Crear área"** | Área creada, redirige a la lista |

---

### 6.2 Listar áreas

**Pantalla:** `/areas`  
**Acceso:** SuperAdmin, Gerente

Grid de tarjetas (3 columnas en pantallas grandes).

**Cada tarjeta muestra:**
- Icono del área (en caja con color)
- Nombre del área (negrita)
- Badge Activa/Inactiva
- Descripción (truncada a 2 líneas)
- Encargado: avatar + nombre (o *"Sin encargado"*)
- Badge con cantidad de miembros
- Identificador de proceso
- Botones: **editar** (lápiz) | **eliminar** (papelera)

**Editar área (modal):**

| Campo | Tipo |
|---|---|
| Icono | Selector visual |
| Nombre | Texto |
| Descripción | Textarea |
| Identificador de proceso | Texto |
| Activa | Toggle switch |

Botones: **"Guardar cambios"** | **"Cancelar"**

**Eliminar área (modal de confirmación):**
- Texto con nombre del área
- Botones: **"Sí, eliminar"** (rojo) | **"Cancelar"**

---

### 6.3 Detalle de área

**Pantalla:** `/areas/:id`  
**Acceso:** SuperAdmin, Gerente

**Secciones:**

1. **Información del área**: icono, nombre, descripción, badge activa/inactiva, identificador, encargado con opción de cambiar
2. **Métricas del área**: tarjetas con total, vencidas, sin progreso, completadas; tasa de completitud; desglose por estado; carga por miembro
3. **Miembros del equipo**: lista de miembros actuales con botón de remover
4. **Trabajadores disponibles**: lista de workers no asignados con botón de **reclamar**
5. **Tareas del área**: lista de tareas filtrable

---

### 6.4 Reclamar trabajadores (Mi equipo) — paso a paso

**Pantalla:** `/claim-workers`  
**Acceso:** Solo Managers

| Sección | Contenido |
|---|---|
| **Mi equipo** | Miembros actuales del área, con botón de remover |
| **Trabajadores disponibles** | Workers sin área, con botón **"Reclamar"** |

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Ve la lista de trabajadores disponibles | Usuarios sin área asignada |
| 2 | Pulsa **"Reclamar"** en un trabajador | Se agrega al equipo |
| 3 | — | El trabajador ahora ve tareas del área |
| 4 | — | El trabajador puede reclamar tareas `pending_assignment` de su área |

**Remover miembro:**

| Paso | Acción | Resultado |
|---|---|---|
| 1 | En la sección "Mi equipo", pulsa **eliminar** en un miembro | Modal de confirmación |
| 2 | Confirma | El miembro se desvincula del área |

---

## 7. Gestión de Usuarios

### 7.1 Listar y administrar usuarios

**Pantalla:** `/users`  
**Acceso:** SuperAdmin, Gerente

#### Filtros
- **Filtro por rol**: Dropdown con todos los roles

#### Crear usuario (formulario expandible) — paso a paso

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Pulsa **"Nuevo usuario"** | Se despliega formulario de creación |
| 2 | Llena nombre, email, contraseña | — |
| 3 | Selecciona **rol** del dropdown | Si el rol requiere área, aparece el campo |
| 4 | Selecciona **área** (si aplica) | — |
| 5 | Pulsa **"Crear"** | Usuario creado, aparece en la lista |

**Campos y validación:**

| Campo | Requerido | Validación |
|---|---|---|
| Nombre | ✅ | Máx. 255 caracteres |
| Correo electrónico | ✅ | Formato email válido |
| Contraseña | ✅ | Mín. 8 chars, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial |
| Confirmar contraseña | ✅ | Debe coincidir con contraseña |
| Rol | ✅ | Dropdown (excluye superadmin) |
| Área | Condicional | Solo si el rol lo requiere |

#### Tabla de usuarios

**Desktop:** tabla con columnas — Usuario | Correo | Rol | Estado | Acciones  
**Mobile:** tarjetas individuales con la misma información

Paginación: 10 usuarios por página, botones **Anterior** / **Siguiente**, *"Página X de Y"*.

#### Editar usuario (modal) — paso a paso

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Pulsa el botón **editar** (lápiz) en un usuario | Se abre modal de edición |
| 2 | Modifica nombre, email, rol o área | — |
| 3 | Pulsa **"Guardar cambios"** | Datos actualizados |

**Cambiar contraseña** (sección separada dentro del modal):

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Escribe nueva contraseña + confirmación | — |
| 2 | Pulsa **"Cambiar contraseña"** | Contraseña actualizada |

**Activar/Desactivar usuario:**

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Pulsa el botón de **activar/desactivar** en la fila | Se alterna el estado |
| 2 | — | Badge cambia a Activo o Inactivo |

---

## 8. Perfil Personal

**Pantalla:** `/profile`  
**Acceso:** Todos los usuarios autenticados

| Campo | Tipo | Requerido |
|---|---|---|
| Nombre | Texto | ✅ |
| Nueva contraseña | Password | — (dejar en blanco para no cambiar) |
| Confirmar contraseña | Password | — (requerido si se llena contraseña) |

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Modifica su nombre o contraseña | — |
| 2 | Pulsa **"Guardar cambios"** | Banner verde de éxito (3 segundos) |
| 3 | Si hay error | Banner rojo con mensaje |

---

## 9. Notificaciones

### 9.1 Panel rápido (Campana)

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Pulsa el icono de **campana** en el header | Se abre panel desplegable |
| 2 | Ve las notificaciones organizadas en tabs | **Todas** / **Organización** / **Personal** |
| 3 | Pulsa **"Marcar todas como leídas"** | Todas las notificaciones se marcan como leídas |
| 4 | Pulsa una notificación | Navega a la tarea relacionada |
| 5 | Pulsa **"Ver todas"** al fondo | Navega a `/notifications` |

### 9.2 Página de notificaciones

**Pantalla:** `/notifications`

Misma estructura que el panel pero en página completa:
- Tabs: **Todas** | **Organización** | **Personal**
- Botón **"Marcar todas como leídas (X)"**
- Paginación completa
- Estado vacío: *"No hay notificaciones en esta categoría"*

### 9.3 Tipos de notificación y cuándo se generan

| Notificación | Cuándo ocurre | Quién la recibe |
|---|---|---|
| **Tarea asignada** | Se asigna una tarea a un usuario | El responsable |
| **Tarea delegada** | Se delega una tarea | El nuevo responsable |
| **Enviada a revisión** | Responsable envía a revisión | El manager del área |
| **Tarea aprobada** | Manager aprueba la tarea | El responsable |
| **Tarea rechazada** | Manager rechaza la tarea | El responsable |
| **Tarea completada** | Se marca como completada | El creador / manager |
| **Tarea cancelada** | Se cancela una tarea | El responsable |
| **Tarea reabierta** | Se reabre una tarea | El responsable |
| **Nuevo comentario** | Alguien comenta en la tarea | Los participantes |
| **Próxima a vencer** | Falta poco para la fecha límite | El responsable |
| **Tarea vencida** | Pasó la fecha límite | El responsable + manager |
| **Alerta inactividad** | Tarea sin actualizaciones recientes | El responsable |
| **Resumen diario** | Automatización diaria | Según configuración |

### 9.4 Toasts automáticos

Cuando llega una notificación nueva (detectada por polling cada 15 segundos):
- Se muestra un toast en la esquina inferior derecha
- Duración: 6 segundos
- Color según tipo:

| Tipo de notificación | Color del toast |
|---|---|
| `task_completed`, `task_approved` | ✅ Verde (éxito) |
| `task_rejected`, `task_cancelled`, `task_overdue` | 🔴 Rojo (error) |
| `task_due_soon`, `inactivity_alert` | 🟡 Amarillo (advertencia) |
| Todos los demás | 🔵 Azul (información) |

---

## 10. Vista Consolidada

**Pantalla:** `/consolidated`  
**Acceso:** SuperAdmin, Gerente

### Filtros
- **Período desde**: fecha inicio
- **Período hasta**: fecha fin
- Botón **"Limpiar"** si hay filtros

### Tarjetas de resumen (5 en fila)

| Métrica | Color |
|---|---|
| Total tareas | Neutro |
| Completadas | Verde |
| Activas | Cyan |
| Vencidas | Rojo |
| Cumplimiento % | Según porcentaje |

### Desglose por área

Tarjeta por cada área con:
- Icono + nombre del área + nombre del encargado
- Badge de tasa de completitud (verde si ≥80%, amarillo si ≥50%, rojo si <50%)
- Grid de mini estadísticas: Total, Completadas, Vencidas, Sin progreso
- Barra de tasa de completitud
- Badges de distribución por estados
- Tarea pendiente más antigua (en días)
- Promedio de días sin actualización

---

## 11. Gestión de Adjuntos

**Pantalla:** `/attachments`  
**Acceso:** SuperAdmin, Gerente

### Filtros
- **Área**: Dropdown selector
- **Búsqueda**: Por nombre de archivo

### Tabla de adjuntos

| Columna | Contenido |
|---|---|
| Archivo | Icono + nombre + extensión |
| Tipo | MIME type |
| Tamaño | Formateado (KB/MB) |
| Subido por | Nombre del usuario |
| Contexto | Enlace a la tarea o "Área" |
| Fecha | Fecha de subida |
| Estado | Badge: Listo / Error / Procesando |
| Acciones | Preview + Descarga + Eliminar |

Paginación con **Anterior** / **Siguiente** y conteo total.

**Preview:** modal con vista previa del archivo.  
**Descarga:** genera URL firmada temporal y descarga el archivo.  
**Eliminar:** modal de confirmación antes de borrar.

---

## 12. Configuración del Sistema

**Pantalla:** `/settings`  
**Acceso:** Solo SuperAdmin

### 5 pestañas

#### ⚙️ Configuración
- Lista de parámetros del sistema (clave-valor)
- Edición inline de cada parámetro
- Botón **"Guardar"** con modal de confirmación

#### ✉️ Plantillas
- Plantillas de mensajes de correo electrónico
- Edición de asunto y cuerpo del mensaje
- Variables insertables (por ejemplo: `{task_title}`, `{user_name}`)
- Toggle activa/inactiva por plantilla

#### 👥 Roles
- Lista de roles del sistema con toggle activo/inactivo
- Cantidad de usuarios asignados a cada rol
- Roles no configurables marcados como tales
- Confirmación antes de desactivar un rol

#### ⚡ Automatización

Botones para disparar manualmente procesos:

| Acción | Descripción |
|---|---|
| **Detectar vencidas** | Busca tareas pasadas de fecha y las marca como `overdue` |
| **Resumen diario** | Envía notificación de resumen a los usuarios |
| **Recordatorios** | Notifica a responsables de tareas próximas a vencer |
| **Detectar inactividad** | Notifica tareas que llevan tiempo sin actualizaciones |

#### ⬆️ Importar
- Subir archivo CSV o Excel para importar tareas masivamente
- Indicador de progreso durante la carga
- Mensaje de resultado con conteo de tareas creadas

---

## 13. Modo Oscuro

Disponible para **todos los usuarios**:

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Pulsa el botón **sol/luna** en la esquina inferior derecha | Cambia entre modo claro y oscuro |
| 2 | — | La preferencia se guarda en el navegador |
| 3 | — | Si no hay preferencia guardada, sigue la del sistema operativo |

---

## 14. Licencia del Sistema

### Efecto en la interfaz

| Estado de licencia | Banner | Botones de crear | Formularios |
|---|---|---|---|
| **Activa** | No hay banner | Habilitados | Funcionan normalmente |
| **Expirada** | Banner naranja con advertencia | Deshabilitados | Bloqueados |
| **Suspendida** | Banner rojo con error | Deshabilitados | Bloqueados |

### Detección automática

Cuando cualquier petición a la API devuelve un error de licencia:

| Tipo de error | Resultado visible |
|---|---|
| `license_denied` | Toast de advertencia |
| `license_expired` | Banner naranja permanente + bloqueo de creación |
| `license_suspended` | Banner rojo permanente + bloqueo de creación |
| `license_unavailable` | Toast de error |
