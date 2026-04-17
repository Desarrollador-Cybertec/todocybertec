# Manual de Usuario por Rol — S!NTyC

Este documento organiza las funcionalidades de S!NTyC desde la perspectiva de cada grupo de roles, indicando qué puede hacer, qué ve y cómo interactuar con cada módulo.

> Para el detalle técnico paso a paso de cada operación, consultar [WORKFLOWS.md](WORKFLOWS.md).

---

## Tabla de contenidos

1. [SuperAdmin](#1-superadmin)
2. [Gerente](#2-gerente)
3. [Manager (Jefe de área / Director / Líder / Coordinador)](#3-manager)
4. [Worker / Analyst](#4-worker--analyst)
5. [Funciones comunes a todos los roles](#5-funciones-comunes)
6. [Resumen de permisos por módulo](#6-resumen-de-permisos-por-módulo)

---

## 1. SuperAdmin

El SuperAdmin tiene acceso total al sistema. Es el único rol que puede acceder a la **Configuración del sistema**.

### ¿Qué veo al ingresar?

**Dashboard ejecutivo** con:
- Saludo personalizado con resumen de tareas activas y vencidas
- Botones rápidos: **"Nueva tarea"** y **"Consolidado"**
- 4 tarjetas de métricas: Activas, Por revisar, Completadas, Por vencer
- Barra de tasa de completitud global
- Distribución de tareas por estado
- Top 5 de carga por usuario (alerta visual si >5 tareas)
- Distribución por área (clickeable para navegar al área)
- Mis tareas personales (las asignadas directamente a mí)

### ¿Qué puedo hacer?

#### Tareas
- **Crear tareas** asignando a cualquier usuario del sistema, a un área específica, o a un correo externo
- **Ver todas las tareas** del sistema con filtros por área, estado, prioridad, tipo (org/personal), fechas y búsqueda
- **Editar** cualquier tarea activa
- **Delegar** tareas a otro usuario
- **Aprobar o rechazar** tareas en revisión
- **Cancelar** cualquier tarea activa
- **Reabrir** tareas completadas, rechazadas o canceladas
- **Eliminar** cualquier tarea (solo si soy el creador o superadmin)
- **Comentar** y **adjuntar archivos** en cualquier tarea

#### Reuniones
- **Crear reuniones** con clasificación, fecha y área
- **Ver todas** las reuniones del sistema
- **Editar** reuniones abiertas
- **Cerrar** reuniones
- **Crear compromisos** (tareas rápidas) desde una reunión
- **Eliminar** reuniones

#### Áreas
- **Crear áreas** con nombre, descripción, icono e identificador de proceso
- **Editar** áreas existentes (nombre, descripción, icono, activar/desactivar)
- **Asignar encargado** a cada área
- **Eliminar** áreas
- **Ver detalle de área** con métricas, miembros, tareas y trabajadores disponibles

#### Usuarios
- **Crear usuarios** con cualquier rol (excepto superadmin)
- **Editar** nombre, email, rol y área de cualquier usuario
- **Cambiar contraseña** de cualquier usuario
- **Activar/Desactivar** usuarios

#### Consolidado
- **Ver la vista consolidada** con métricas globales y por área
- **Filtrar por período** de fechas

#### Adjuntos
- **Ver todos los adjuntos** del sistema, filtrados por área
- **Descargar** y **previsualizar** cualquier adjunto
- **Eliminar** adjuntos

#### Configuración del Sistema
- **Configuración**: editar parámetros del sistema (clave-valor)
- **Plantillas**: gestionar plantillas de correo electrónico
- **Roles**: activar/desactivar roles del sistema
- **Automatización**: ejecutar manualmente detección de vencidas, resúmenes, recordatorios, alertas de inactividad
- **Importar**: cargar archivos CSV/Excel para crear tareas masivamente

---

## 2. Gerente

El Gerente tiene las mismas capacidades que el SuperAdmin **excepto**:
- ❌ No puede acceder a **Configuración del sistema**
- ❌ No puede crear usuarios con rol `superadmin`

### ¿Qué veo al ingresar?

El **mismo dashboard ejecutivo** que el SuperAdmin con todas las métricas globales.

### ¿Qué puedo hacer?

Mismas capacidades que el SuperAdmin en los módulos de:
- ✅ Tareas (crear, ver, editar, delegar, aprobar, rechazar, cancelar, reabrir)
- ✅ Reuniones (crear, ver, editar, cerrar, compromisos)
- ✅ Áreas (crear, ver, editar, asignar encargados)
- ✅ Usuarios (crear, editar, activar/desactivar, cambiar contraseña)
- ✅ Consolidado (ver métricas globales y por área)
- ✅ Adjuntos (ver, descargar, previsualizar, eliminar)
- ❌ Configuración del sistema (no accesible)

---

## 3. Manager

Incluye los roles: **Jefe de Área** (`area_manager`), **Director** (`director`), **Líder** (`leader`), **Coordinador** (`coordinator`).

Todos comparten las mismas funcionalidades en la interfaz. Su ámbito de acción es **su propia área**.

### ¿Qué veo al ingresar?

**Dashboard de área** con:
- Saludo personalizado con resumen de tareas del área y propias
- Botones rápidos: **"Nueva tarea"** | **"Mi equipo"** | **Notificaciones**

**Panel de área:**
- 4 mini tarjetas: Total del área, Vencidas, Sin progreso, Completadas
- Barra de tasa de completitud del área
- Carga del equipo: cada miembro con su cantidad de tareas y barra de progreso
- Desglose por estado del área

**Tareas urgentes:**
- Tareas del equipo vencidas, rechazadas, en progreso con alta prioridad
- Máximo 4 mostradas con acciones rápidas

**Mis próximas tareas:**
- Tareas asignadas directamente al manager
- Ordenadas por prioridad y fecha

### ¿Qué puedo hacer?

#### Tareas
- **Crear tareas** asignando a miembros de mi equipo, a mi área, o a un correo externo
- **Ver tareas** de mi equipo y las asignadas a mí
- **Editar** tareas de las que soy participante (creador, responsable, o del equipo)
- **Delegar** tareas que tengo asignadas a otro miembro del equipo
- **Aprobar o rechazar** tareas de mi equipo que están en revisión
- **Cancelar** tareas de mi equipo
- **Reabrir** tareas de mi equipo
- **Comentar** y **adjuntar archivos** en tareas de mi equipo
- **Cambiar estado** inline desde la lista de tareas

#### Reuniones
- **Crear reuniones** para mi área (área preseleccionada, solo lectura)
- **Ver reuniones** de mi área
- **Editar** reuniones abiertas de mi área
- **Cerrar** reuniones de mi área
- **Crear compromisos** desde reuniones, asignando a miembros del equipo

#### Mi equipo (Reclamar trabajadores)
- **Ver miembros** actuales de mi área
- **Reclamar trabajadores** disponibles (sin área asignada) para añadirlos a mi equipo
- **Remover miembros** de mi equipo (con confirmación)

#### Notificaciones
- Recibir notificaciones cuando un miembro del equipo envía una tarea a revisión
- Recibir notificaciones de tareas vencidas en mi área
- Recibir alertas de inactividad de tareas de mi equipo

### ¿Qué NO puedo hacer?
- ❌ Ver áreas (módulo de Áreas)
- ❌ Ver usuarios (módulo de Usuarios)
- ❌ Ver vista consolidada
- ❌ Ver adjuntos (módulo global)
- ❌ Configurar el sistema

---

## 4. Worker / Analyst

Estos roles representan a los ejecutores de tareas. Ambos roles tienen las mismas funcionalidades.

### ¿Qué veo al ingresar?

**Dashboard personal** con:
- Saludo personalizado con resumen de tareas activas
- Botón rápido: **"Nueva tarea"**

**Lo importante hoy:**
- Tareas asignadas por un superior (organizacionales)
- Ordenadas por prioridad y fecha de vencimiento
- Destacado visual si están vencidas

**Resumen rápido:**
- 4 mini tarjetas: Activas, Vencidas, En revisión, Completadas
- Alerta si hay tareas próximas a vencer

**Por iniciar:**
- Tareas con estado `pending` o `pending_assignment` que puedo reclamar

**Mis tareas activas:**
- Tareas en progreso, revisión, rechazadas o vencidas
- Botón **"Actualizar"** en cada una para reportar avance

### ¿Qué puedo hacer?

#### Tareas
- **Crear tareas personales** (opción *"Para mí"*) — no requieren aprobación
- **Crear tareas para un externo** vía correo electrónico
- **Reclamar** tareas asignadas a mi área que no tienen responsable individual (`pending_assignment`)
- **Iniciar** tareas que me fueron asignadas
- **Reportar avance**: subir progreso, evidencia o notas
- **Enviar a revisión** si la tarea requiere aprobación del manager
- **Completar** tareas directamente si no requieren aprobación
- **Adjuntar archivos**: evidencias, soportes, entregas finales
- **Comentar** en mis tareas
- **Delegar** tareas que tengo asignadas (a otro worker del equipo)

#### Notificaciones
- Recibir notificaciones cuando me asignan una tarea
- Recibir notificaciones cuando delegan una tarea hacia mí
- Recibir notificaciones de aprobación o rechazo
- Recibir recordatorios de tareas próximas a vencer
- Recibir alertas de inactividad

### ¿Qué NO puedo hacer?
- ❌ Aprobar o rechazar tareas
- ❌ Cancelar tareas (solo admin/manager)
- ❌ Reabrir tareas
- ❌ Eliminar tareas (solo el creador si fue él)
- ❌ Crear o ver reuniones
- ❌ Gestionar áreas
- ❌ Gestionar usuarios
- ❌ Ver vista consolidada
- ❌ Ver adjuntos (módulo global)
- ❌ Configurar el sistema

### Flujo típico del día a día

```
1. Abro S!NTyC → veo "Lo importante hoy"
2. Identifico las tareas más urgentes (vencidas o de alta prioridad)
3. Pulso "Iniciar" en la primera tarea pendiente
4. Trabajo en la tarea: subo adjuntos, reporto avance
5. Al terminar: "Enviar a revisión" o "Completar"
6. Reviso notificaciones: ¿alguna tarea fue rechazada? → corrijo y reenvío
7. Reviso "Por iniciar": ¿hay tareas nuevas asignadas?
8. Si veo tareas "pending_assignment" de mi área: puedo "Reclamar"
```

---

## 5. Funciones comunes a todos los roles

Estas funcionalidades están disponibles sin importar el rol del usuario:

### Perfil personal
- Ver y editar mi nombre
- Cambiar mi contraseña

### Modo oscuro
- Toggle sol/luna en la esquina inferior derecha
- Se guarda la preferencia en el navegador
- Si no hay preferencia, sigue la del sistema operativo

### Notificaciones
- Ver campana con badge de no leídas
- Panel desplegable con tabs: Todas / Organización / Personal
- Página completa de notificaciones con paginación
- Marcar todas como leídas
- Click en notificación → navega a la tarea

### Toasts automáticos
- Se muestran al recibir nuevas notificaciones
- Colores según tipo (éxito, error, advertencia, info)
- Duración: 6 segundos
- Posición: esquina inferior derecha

### Sesión y autenticación
- Login con correo y contraseña
- Cierre de sesión manual
- Sesión expira automáticamente si el token es inválido (401)

---

## 6. Resumen de permisos por módulo

| Módulo | SuperAdmin | Gerente | Manager | Worker/Analyst |
|---|---|---|---|---|
| **Dashboard** | Ejecutivo global | Ejecutivo global | De área | Personal |
| **Tareas — ver** | Todas | Todas | De su equipo + propias | Solo propias + de su área |
| **Tareas — crear** | A cualquiera | A cualquiera | A su equipo / área | Personal o correo externo |
| **Tareas — aprobar** | ✅ Todas | ✅ Todas | ✅ De su equipo | ❌ |
| **Tareas — cancelar** | ✅ | ✅ | ✅ Su equipo | ❌ |
| **Tareas — reabrir** | ✅ | ✅ | ✅ Su equipo | ❌ |
| **Tareas — eliminar** | ✅ Cualquiera | Propias | Propias | Propias |
| **Reuniones** | CRUD completo | CRUD completo | CRUD de su área | ❌ |
| **Áreas** | CRUD completo | CRUD completo | ❌ (ve solo su equipo) | ❌ |
| **Usuarios** | CRUD completo | CRUD (sin superadmin) | ❌ | ❌ |
| **Consolidado** | ✅ | ✅ | ❌ | ❌ |
| **Adjuntos** | ✅ | ✅ | ❌ | ❌ |
| **Configuración** | ✅ (5 tabs) | ❌ | ❌ | ❌ |
| **Mi equipo** | ❌ | ❌ | ✅ (reclamar workers) | ❌ |
| **Perfil** | ✅ | ✅ | ✅ | ✅ |
| **Notificaciones** | ✅ | ✅ | ✅ | ✅ |
| **Modo oscuro** | ✅ | ✅ | ✅ | ✅ |
