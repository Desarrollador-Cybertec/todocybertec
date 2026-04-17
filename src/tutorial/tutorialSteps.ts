import type { DriveStep } from 'driver.js';
import type { RoleType } from '../types/enums';
import { ADMIN_ROLES, MANAGER_ROLES, WORKER_ROLES } from '../types/enums';

/* ------------------------------------------------------------------ */
/*  Tutorial category (each one is a standalone guided tour)          */
/* ------------------------------------------------------------------ */
export interface TutorialDef {
  id: string;
  title: string;
  description: string;
  icon: string;           // emoji for the menu
  roles: RoleType[];      // which roles see this tutorial
  /** Route where the tutorial starts (null = any / current) */
  startRoute: string | null;
  steps: DriveStep[];
}

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                    */
/* ------------------------------------------------------------------ */
const ALL_ROLES: RoleType[] = [...ADMIN_ROLES, ...MANAGER_ROLES, ...WORKER_ROLES];

/* ------------------------------------------------------------------ */
/*  1. Welcome / Layout tour  (everyone)                              */
/* ------------------------------------------------------------------ */
const welcomeTour: TutorialDef = {
  id: 'welcome',
  title: 'Bienvenido a S!NTyC',
  description: 'Conoce la interfaz principal y la navegación del sistema.',
  icon: '👋',
  roles: ALL_ROLES,
  startRoute: '/dashboard',
  steps: [
    {
      popover: {
        title: '¡Bienvenido a S!NTyC! 🎉',
        description:
          'Este tutorial te guiará por las funcionalidades principales del sistema. Puedes repetirlo en cualquier momento desde el botón de ayuda en la barra lateral.',
      },
    },
    {
      element: '#sidebar-brand',
      popover: {
        title: 'Barra lateral',
        description:
          'Aquí encontrarás el menú de navegación principal. Desde la barra lateral puedes acceder a todas las secciones del sistema según tu rol.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#sidebar-nav',
      popover: {
        title: 'Menú de navegación',
        description:
          'Las opciones del menú se adaptan a tu rol. Solo verás las secciones a las que tienes acceso.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#nav-dashboard',
      popover: {
        title: 'Dashboard',
        description:
          'Tu panel principal con métricas y resúmenes. La vista se adapta según tu rol: ejecutiva para administradores, de equipo para managers, y personal para trabajadores.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#nav-tasks',
      popover: {
        title: 'Tareas',
        description:
          'Gestiona todas tus tareas: crea, asigna, da seguimiento y completa tareas. Incluye filtros avanzados y vista de detalle.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#sidebar-user-card',
      popover: {
        title: 'Tu perfil',
        description:
          'Aquí ves tu nombre, rol y área. Haz clic para editar tu perfil y cambiar tu contraseña.',
        side: 'right',
        align: 'end',
      },
    },
    {
      element: '#dark-mode-toggle',
      popover: {
        title: 'Modo oscuro',
        description:
          'Cambia entre modo claro y oscuro según tu preferencia. La configuración se guarda automáticamente.',
        side: 'left',
        align: 'end',
      },
    },
    {
      element: '#tutorial-trigger-btn',
      popover: {
        title: 'Centro de ayuda',
        description:
          '¿Necesitas repasar algo? Desde este botón puedes acceder a todos los tutoriales disponibles para tu rol en cualquier momento.',
        side: 'right',
        align: 'end',
      },
    },
    {
      popover: {
        title: '¡Listo para empezar! 🚀',
        description:
          'Ya conoces lo básico. Explora el sistema y recuerda que puedes repetir cualquier tutorial desde el botón de ayuda. ¡Éxito!',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  2. Dashboard tour  (by role group)                                */
/* ------------------------------------------------------------------ */
const dashboardAdminTour: TutorialDef = {
  id: 'dashboard-admin',
  title: 'Dashboard ejecutivo',
  description: 'Conoce tu panel de métricas globales y cómo interpretar los indicadores.',
  icon: '📊',
  roles: [...ADMIN_ROLES],
  startRoute: '/dashboard',
  steps: [
    {
      popover: {
        title: 'Dashboard Ejecutivo',
        description:
          'Como administrador, tu dashboard muestra métricas globales del sistema: tareas activas, completadas, vencidas y tasas de cumplimiento.',
      },
    },
    {
      element: '#dashboard-stats',
      popover: {
        title: 'Tarjetas de métricas',
        description:
          'Cada tarjeta muestra un indicador clave: tareas activas, completadas, vencidas y porcentaje de cumplimiento global.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '#dashboard-content',
      popover: {
        title: 'Gráficos y detalle',
        description:
          'Aquí encontrarás gráficos de distribución por área, carga de trabajo por usuario y tendencias de cumplimiento.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

const dashboardManagerTour: TutorialDef = {
  id: 'dashboard-manager',
  title: 'Dashboard de equipo',
  description: 'Aprende a monitorear las métricas de tu área y equipo.',
  icon: '📊',
  roles: [...MANAGER_ROLES],
  startRoute: '/dashboard',
  steps: [
    {
      popover: {
        title: 'Dashboard de Área',
        description:
          'Como manager, tu dashboard se enfoca en tu equipo: tareas del área, vencidas, sin avance y pendientes de asignación.',
      },
    },
    {
      element: '#dashboard-stats',
      popover: {
        title: 'Métricas del equipo',
        description:
          'Revisa el total de tareas de tu área, cuántas están vencidas, sin avance y pendientes de asignación. Identifica rápidamente lo que necesita atención.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '#dashboard-content',
      popover: {
        title: 'Carga de trabajo',
        description:
          'Visualiza cómo se distribuyen las tareas entre los miembros de tu equipo y detecta sobrecargas o disponibilidad.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

const dashboardWorkerTour: TutorialDef = {
  id: 'dashboard-worker',
  title: 'Mi dashboard personal',
  description: 'Aprende a usar tu panel personal y priorizar tu día.',
  icon: '📊',
  roles: [...WORKER_ROLES],
  startRoute: '/dashboard',
  steps: [
    {
      popover: {
        title: 'Tu Dashboard Personal',
        description:
          'Este es tu centro de operaciones diario. Aquí ves tus tareas activas, urgentes del día y un resumen rápido de tu carga.',
      },
    },
    {
      element: '#dashboard-stats',
      popover: {
        title: 'Lo importante hoy',
        description:
          'Estas tarjetas te muestran cuántas tareas tienes activas, cuáles son urgentes y tu progreso general. Comienza tu día revisándolas.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '#dashboard-content',
      popover: {
        title: 'Tus tareas activas',
        description:
          'Aquí ves el detalle de tus tareas. Identifica las más urgentes y comienza a trabajar en ellas.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  3. Tasks tour (everyone, but content varies)                      */
/* ------------------------------------------------------------------ */
const tasksGeneralTour: TutorialDef = {
  id: 'tasks',
  title: 'Gestión de tareas',
  description: 'Aprende a crear, filtrar y gestionar tareas.',
  icon: '📋',
  roles: ALL_ROLES,
  startRoute: '/tasks',
  steps: [
    {
      popover: {
        title: 'Módulo de Tareas',
        description:
          'Aquí gestionas todas tus tareas. Puedes ver las que te han asignado, las que has creado y filtrar por diferentes criterios.',
      },
    },
    {
      element: '#tasks-filters',
      popover: {
        title: 'Filtros',
        description:
          'Usa los filtros para encontrar tareas por estado (pendiente, en progreso, completada), prioridad, área o responsable.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#tasks-list',
      popover: {
        title: 'Lista de tareas',
        description:
          'Cada tarjeta muestra el título, estado, prioridad, responsable y fecha límite. Haz clic en cualquier tarea para ver su detalle completo.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#task-create-btn',
      popover: {
        title: 'Crear nueva tarea',
        description:
          'Haz clic aquí para crear una nueva tarea. Podrás asignar responsable, prioridad, fecha límite y adjuntar archivos.',
        side: 'left',
        align: 'start',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  4. Task workflow tour (workers)                                   */
/* ------------------------------------------------------------------ */
const taskWorkflowWorkerTour: TutorialDef = {
  id: 'task-workflow-worker',
  title: 'Flujo de trabajo diario',
  description: 'Aprende el ciclo completo de una tarea: iniciar, reportar avance y enviar a revisión.',
  icon: '🔄',
  roles: [...WORKER_ROLES],
  startRoute: null,
  steps: [
    {
      popover: {
        title: 'Tu flujo de trabajo diario 🔄',
        description:
          'Como trabajador/analista, tu ciclo típico es: ver tareas asignadas → iniciar → reportar avance → enviar a revisión (o completar). Veamos cada paso.',
      },
    },
    {
      popover: {
        title: 'Paso 1: Revisar tareas',
        description:
          'Entra al Dashboard o a Tareas para ver qué tienes pendiente. Las tareas en "Pendiente" están listas para que las inicies.',
      },
    },
    {
      popover: {
        title: 'Paso 2: Iniciar tarea',
        description:
          'Abre una tarea pendiente y haz clic en "Iniciar". La tarea cambiará a "En progreso" y podrás comenzar a trabajar.',
      },
    },
    {
      popover: {
        title: 'Paso 3: Reportar avance',
        description:
          'Dentro de la tarea puedes subir archivos de evidencia, dejar comentarios de progreso y registrar tus avances.',
      },
    },
    {
      popover: {
        title: 'Paso 4: Enviar a revisión',
        description:
          'Cuando termines, haz clic en "Enviar a revisión". Tu manager revisará y aprobará o te pedirá cambios. Si la tarea no requiere aprobación, puedes completarla directamente.',
      },
    },
    {
      popover: {
        title: 'Paso 5: Reclamar tareas',
        description:
          'En tu Dashboard verás tareas "Pendientes de asignación" en tu área. ¡Puedes reclamarlas para ti y comenzar a trabajar!',
      },
    },
    {
      popover: {
        title: '¡Ya sabes el flujo! ✅',
        description:
          'Recuerda: Pendiente → Iniciar → Reportar avance → Enviar a revisión → ¡Completada! Revisa tus notificaciones por si tu manager tiene feedback.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  5. Task approval tour (managers)                                  */
/* ------------------------------------------------------------------ */
const taskApprovalTour: TutorialDef = {
  id: 'task-approval',
  title: 'Aprobación de tareas',
  description: 'Aprende a revisar, aprobar o rechazar tareas de tu equipo.',
  icon: '✅',
  roles: [...ADMIN_ROLES, ...MANAGER_ROLES],
  startRoute: null,
  steps: [
    {
      popover: {
        title: 'Flujo de aprobación ✅',
        description:
          'Cuando un miembro de tu equipo envía una tarea a revisión, tú decides si se aprueba o necesita ajustes.',
      },
    },
    {
      popover: {
        title: 'Notificaciones de revisión',
        description:
          'Recibirás una notificación cuando alguien envíe una tarea a revisión. También puedes filtrar tareas "En revisión" en el listado.',
      },
    },
    {
      popover: {
        title: 'Revisar la tarea',
        description:
          'Abre la tarea, revisa los archivos adjuntos, comentarios y avances reportados. Verifica que cumple con lo solicitado.',
      },
    },
    {
      popover: {
        title: 'Aprobar o rechazar',
        description:
          'Si todo está bien, haz clic en "Aprobar" para completar la tarea. Si necesita cambios, usa "Rechazar" con una nota explicando qué falta. La tarea volverá al trabajador.',
      },
    },
    {
      popover: {
        title: 'Otras acciones',
        description:
          'También puedes cancelar tareas que ya no son necesarias, reabrir tareas completadas si se requieren ajustes, o delegar a otro miembro del equipo.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  6. Meetings tour (admin + manager)                                */
/* ------------------------------------------------------------------ */
const meetingsTour: TutorialDef = {
  id: 'meetings',
  title: 'Reuniones',
  description: 'Crea reuniones, registra acuerdos y genera tareas rápidas.',
  icon: '📅',
  roles: [...ADMIN_ROLES, ...MANAGER_ROLES],
  startRoute: '/meetings',
  steps: [
    {
      popover: {
        title: 'Módulo de Reuniones 📅',
        description:
          'Aquí gestionas todas las reuniones: crea, da seguimiento a acuerdos y genera tareas rápidas desde los compromisos.',
      },
    },
    {
      element: '#meetings-list',
      popover: {
        title: 'Lista de reuniones',
        description:
          'Ve todas las reuniones creadas con su fecha, clasificación (estratégica, operativa, seguimiento, revisión) y estado.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#meeting-create-btn',
      popover: {
        title: 'Crear reunión',
        description:
          'Crea una nueva reunión indicando participantes, fecha, clasificación y agenda. Después podrás registrar acuerdos.',
        side: 'left',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Compromisos rápidos',
        description:
          'Dentro de cada reunión puedes crear tareas rápidas directamente de los acuerdos. Estas se asignan automáticamente y aparecen en el módulo de tareas.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  7. Areas tour (admin only)                                        */
/* ------------------------------------------------------------------ */
const areasTour: TutorialDef = {
  id: 'areas',
  title: 'Gestión de áreas',
  description: 'Crea y administra las áreas organizacionales.',
  icon: '🏢',
  roles: [...ADMIN_ROLES],
  startRoute: '/areas',
  steps: [
    {
      popover: {
        title: 'Módulo de Áreas 🏢',
        description:
          'Las áreas son las divisiones organizacionales del sistema. Cada área tiene un manager responsable y miembros asignados.',
      },
    },
    {
      element: '#areas-list',
      popover: {
        title: 'Lista de áreas',
        description:
          'Ve todas las áreas con su nombre, manager asignado, cantidad de miembros y métricas de tareas.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#area-create-btn',
      popover: {
        title: 'Crear área',
        description:
          'Crea una nueva área organizacional. Asigna un nombre, ícono, descripción y selecciona al manager responsable.',
        side: 'left',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Detalle de área',
        description:
          'Al abrir un área verás sus métricas, miembros actuales, trabajadores disponibles para asignar y las tareas del área.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  8. Users tour (admin only)                                        */
/* ------------------------------------------------------------------ */
const usersTour: TutorialDef = {
  id: 'users',
  title: 'Gestión de usuarios',
  description: 'Administra los usuarios del sistema: roles, permisos y estados.',
  icon: '👥',
  roles: [...ADMIN_ROLES],
  startRoute: '/users',
  steps: [
    {
      popover: {
        title: 'Módulo de Usuarios 👥',
        description:
          'Administra todos los usuarios del sistema. Crea cuentas, asigna roles, activa/desactiva usuarios y gestiona contraseñas.',
      },
    },
    {
      element: '#users-list',
      popover: {
        title: 'Lista de usuarios',
        description:
          'Ve todos los usuarios con su nombre, email, rol y estado (activo/inactivo). Usa los filtros para buscar rápidamente.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#user-create-btn',
      popover: {
        title: 'Crear usuario',
        description:
          'Crea nuevos usuarios asignándoles nombre, email, contraseña y rol. El rol determina qué funcionalidades podrán usar.',
        side: 'left',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Roles del sistema',
        description:
          'Los roles disponibles son: Gerente (acceso global), Manager de Área/Director/Líder/Coordinador (acceso al área), Trabajador/Analista (tareas personales).',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  9. Team claiming tour (manager only)                              */
/* ------------------------------------------------------------------ */
const teamClaimTour: TutorialDef = {
  id: 'team-claim',
  title: 'Reclamar equipo',
  description: 'Aprende a incorporar trabajadores disponibles a tu área.',
  icon: '🤝',
  roles: [...MANAGER_ROLES],
  startRoute: '/claim-workers',
  steps: [
    {
      popover: {
        title: 'Mi Equipo 🤝',
        description:
          'Como manager, puedes incorporar trabajadores disponibles (sin área asignada) a tu equipo.',
      },
    },
    {
      element: '#claim-current-team',
      popover: {
        title: 'Tu equipo actual',
        description:
          'Aquí ves los miembros actuales de tu área. Puedes remover trabajadores si es necesario.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '#claim-available',
      popover: {
        title: 'Trabajadores disponibles',
        description:
          'Estos son los trabajadores sin área asignada. Haz clic en "Reclamar" para agregarlos a tu equipo.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  10. Settings tour (superadmin only)                               */
/* ------------------------------------------------------------------ */
const settingsTour: TutorialDef = {
  id: 'settings',
  title: 'Configuración del sistema',
  description: 'Configura parámetros, plantillas, roles y automatizaciones.',
  icon: '⚙️',
  roles: ['superadmin'],
  startRoute: '/settings',
  steps: [
    {
      popover: {
        title: 'Configuración del Sistema ⚙️',
        description:
          'Como SuperAdmin, tienes acceso exclusivo a la configuración del sistema. Aquí controlas todos los parámetros operativos.',
      },
    },
    {
      popover: {
        title: 'Parámetros del sistema',
        description:
          'Configura valores clave-valor que controlan el comportamiento del sistema: límites, opciones predeterminadas, etc.',
      },
    },
    {
      popover: {
        title: 'Plantillas de correo',
        description:
          'Personaliza las plantillas de correo electrónico que el sistema envía automáticamente (notificaciones, recordatorios, etc.).',
      },
    },
    {
      popover: {
        title: 'Gestión de roles',
        description:
          'Activa o desactiva roles del sistema. Esto controla qué tipos de usuarios se pueden crear.',
      },
    },
    {
      popover: {
        title: 'Automatizaciones',
        description:
          'Configura disparadores automáticos: detección de tareas vencidas, envío de resúmenes, recordatorios de vencimiento y alertas de inactividad.',
      },
    },
    {
      popover: {
        title: 'Importación masiva',
        description:
          'Importa tareas masivamente desde archivos CSV o Excel. Ideal para migraciones o carga inicial de datos.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  11. Consolidated tour (admin only)                                */
/* ------------------------------------------------------------------ */
const consolidatedTour: TutorialDef = {
  id: 'consolidated',
  title: 'Reporte consolidado',
  description: 'Consulta métricas globales filtradas por rango de fechas.',
  icon: '📈',
  roles: [...ADMIN_ROLES],
  startRoute: '/consolidated',
  steps: [
    {
      popover: {
        title: 'Reporte Consolidado 📈',
        description:
          'Obtén una vista global de las métricas del sistema filtradas por rango de fechas. Ideal para reportes ejecutivos.',
      },
    },
    {
      element: '#consolidated-filters',
      popover: {
        title: 'Filtros de fecha',
        description:
          'Selecciona un rango de fechas para analizar las métricas en ese periodo específico.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#consolidated-content',
      popover: {
        title: 'Métricas consolidadas',
        description:
          'Ve el resumen de tareas completadas, pendientes, vencidas y porcentaje de cumplimiento en el periodo seleccionado.',
        side: 'top',
        align: 'center',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  12. Notifications tour (everyone)                                 */
/* ------------------------------------------------------------------ */
const notificationsTour: TutorialDef = {
  id: 'notifications',
  title: 'Notificaciones',
  description: 'Entiende cómo funcionan las notificaciones y alertas del sistema.',
  icon: '🔔',
  roles: ALL_ROLES,
  startRoute: null,
  steps: [
    {
      popover: {
        title: 'Sistema de Notificaciones 🔔',
        description:
          'El sistema te notifica automáticamente sobre eventos importantes: tareas asignadas, cambios de estado, vencimientos y más.',
      },
    },
    {
      popover: {
        title: 'Tipos de notificación',
        description:
          'Recibirás notificaciones de: nuevas asignaciones, tareas enviadas a revisión, aprobaciones/rechazos, vencimientos próximos y alertas de inactividad.',
      },
    },
    {
      popover: {
        title: 'Notificaciones en tiempo real',
        description:
          'Las notificaciones se actualizan automáticamente. Verás un toast emergente cuando llegue una nueva notificación y el contador se actualizará.',
      },
    },
    {
      popover: {
        title: 'Historial completo',
        description:
          'Accede al historial completo de notificaciones con pestañas para filtrar entre todas, organizacionales y personales.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  13. Task creation tour (everyone) — extended                      */
/* ------------------------------------------------------------------ */
const taskCreationTour: TutorialDef = {
  id: 'task-creation',
  title: 'Crear una tarea paso a paso',
  description: 'Aprende a completar el formulario de creación con todos sus campos, opciones avanzadas y vista previa.',
  icon: '✏️',
  roles: ALL_ROLES,
  startRoute: '/tasks/new',
  steps: [
    {
      popover: {
        title: 'Crear una nueva tarea ✏️',
        description:
          'Vamos a recorrer el formulario completo paso a paso. Verás la creación rápida, las opciones avanzadas y la vista previa en tiempo real.',
      },
    },
    {
      element: '#task-create-form',
      popover: {
        title: 'Formulario de creación rápida',
        description:
          'Este es el formulario principal. Solo necesitas un título para crear la tarea, pero te recomendamos completar todos los campos para un mejor seguimiento.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#title',
      popover: {
        title: '1. Título de la tarea *',
        description:
          'Escribe un título claro y descriptivo. Ejemplo: "Enviar informe semanal" o "Revisar presupuesto Q3". Es el único campo obligatorio para crear la tarea.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#assigned_to_user_id, [aria-labelledby="destLabel"]',
      popover: {
        title: '2. Responsable / Destino',
        description:
          'Elige quién ejecutará la tarea. Si eres trabajador puedes asignártela a ti o enviarla a un correo externo. Si eres manager/admin puedes elegir cualquier usuario del sistema.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#due_date',
      popover: {
        title: '3. Fecha límite',
        description:
          'Establece cuándo debe completarse. El sistema enviará recordatorios automáticos antes del vencimiento y alertas si se pasa la fecha. ¡Recomendado para todo tipo de tarea!',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#task-create-priority',
      popover: {
        title: '4. Prioridad',
        description:
          'Selecciona la urgencia: Baja (informativa), Media (normal), Alta (urgente) o Crítica (atención inmediata). Afecta el orden en listados y la visibilidad en el dashboard.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#task-create-advanced-btn',
      popover: {
        title: '5. Opciones avanzadas',
        description:
          'Expande esta sección para acceder a descripción detallada, asignación por área, vincular con reuniones, requisitos de cumplimiento y configuración de notificaciones.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#task-create-preview',
      popover: {
        title: 'Vista previa en tiempo real',
        description:
          'En la barra lateral derecha ves cómo quedará tu tarea mientras la creas: título, prioridad, responsable, fecha y requisitos activos. También encontrarás consejos útiles.',
        side: 'left',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Opciones avanzadas: Detalles adicionales 📋',
        description:
          'Al expandir las opciones avanzadas, la primera sección te permite agregar: una descripción detallada de la tarea, fecha de inicio, y vincular la tarea con una reunión existente (solo para managers/admin).',
      },
    },
    {
      popover: {
        title: 'Opciones avanzadas: Asignación alternativa 🔀',
        description:
          'Si eres manager o admin, puedes asignar la tarea a un área completa (cualquier miembro podrá reclamarla) o a un correo externo (persona fuera del sistema). Solo una opción de asignación puede estar activa.',
      },
    },
    {
      popover: {
        title: 'Opciones avanzadas: Requisitos ✅',
        description:
          'Configura qué necesita la tarea para completarse: "Requiere adjunto" obliga a subir evidencia, "Comentario de cierre" exige una nota al completar, "Aprobación del jefe" envía la tarea a revisión del manager antes de cerrarla.',
      },
    },
    {
      popover: {
        title: 'Opciones avanzadas: Notificaciones 🔔',
        description:
          'Personaliza los avisos: "Al vencer" avisa el día del vencimiento, "Si vencida" alerta cuando pasa la fecha, "Al completar" notifica cuando la tarea se cierra. Actívalos según la importancia.',
      },
    },
    {
      element: '#task-create-submit',
      popover: {
        title: '6. Crear la tarea',
        description:
          'Haz clic en "Crear tarea". Se abrirá un modal de confirmación mostrando el título. Confirma para crear o vuelve a revisar los datos.',
        side: 'top',
        align: 'end',
      },
    },
    {
      popover: {
        title: '¡Tutorial completo! 🎯',
        description:
          'Ya conoces todas las opciones de creación. Puedes crear tareas rápidas con solo un título, o usar las opciones avanzadas para tareas con requisitos, notificaciones y asignaciones específicas.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  13b. Task editing & detail tour (everyone)                        */
/* ------------------------------------------------------------------ */
const taskEditingTour: TutorialDef = {
  id: 'task-editing',
  title: 'Editar y gestionar tareas',
  description: 'Aprende a editar tareas, cambiar estado, delegar, adjuntar archivos y comentar.',
  icon: '🛠️',
  roles: ALL_ROLES,
  startRoute: null,
  steps: [
    {
      popover: {
        title: 'Editar y gestionar tareas 🛠️',
        description:
          'Desde el detalle de una tarea puedes editar sus datos, cambiar su estado, delegar, adjuntar archivos y más. Veamos cada acción disponible.',
      },
    },
    {
      popover: {
        title: 'Paso 1: Abrir el detalle',
        description:
          'Desde el listado de tareas, haz clic en cualquier tarea para abrir su vista de detalle. Verás toda la información organizada en secciones.',
      },
    },
    {
      popover: {
        title: 'Información de la tarea',
        description:
          'En la parte superior verás: título, descripción, badges de estado y prioridad. Debajo encontrarás el grid con creador, responsable, área, fecha límite, barra de avance y antigüedad.',
      },
    },
    {
      popover: {
        title: 'Barra de acciones',
        description:
          'Debajo de la información hay una barra con todas las acciones disponibles según tu rol y permisos. Las acciones se adaptan al estado actual de la tarea.',
      },
    },
    {
      popover: {
        title: 'Cambiar estado ↔️',
        description:
          'El selector de estado te muestra solo las transiciones válidas. Como worker: Pendiente → En progreso → En revisión. Como manager: puedes Aprobar, Rechazar, Reabrir o Cancelar.',
      },
    },
    {
      popover: {
        title: 'Editar tarea ✏️',
        description:
          'El botón "Editar" (amarillo) activa el modo de edición inline. Podrás modificar: título, descripción, prioridad, requisitos (adjuntos, comentarios, aprobación) y configuración de notificaciones. Haz clic en "Guardar" para confirmar los cambios.',
      },
    },
    {
      popover: {
        title: 'Modo de edición: Campos',
        description:
          'En modo edición verás: campo de título editable, textarea de descripción, selector de prioridad (Baja/Media/Alta/Crítica), checkboxes de requisitos y checkboxes de notificaciones.',
      },
    },
    {
      popover: {
        title: 'Delegar tarea 🔄',
        description:
          'El botón "Delegar" permite reasignar la tarea a otro miembro. Selecciona al nuevo responsable de tu área (o de todo el sistema si eres admin) y agrega una nota explicativa. El historial registra la delegación.',
      },
    },
    {
      popover: {
        title: 'Adjuntar archivos 📎',
        description:
          'Haz clic en "Adjuntar" para subir archivos de evidencia. Selecciona el tipo de archivo (evidencia, soporte, etc.), elige el archivo (máx. 20MB) y sube. Los adjuntos se muestran como tarjetas con vista previa.',
      },
    },
    {
      popover: {
        title: 'Comentar 💬',
        description:
          'El botón "Comentar" abre un formulario para dejar notas. Los comentarios quedan en el historial de la tarea y son visibles para todos los participantes (creador, responsable, manager del área).',
      },
    },
    {
      popover: {
        title: 'Eliminar tarea 🗑️',
        description:
          'Si tienes permisos (creador o admin), puedes eliminar la tarea. Se pedirá confirmación doble antes de borrar permanentemente.',
      },
    },
    {
      popover: {
        title: 'Secciones inferiores',
        description:
          'Debajo de la tarjeta principal encontrarás: Adjuntos (galería de archivos), Comentarios (paginados), Historial de estados (línea de tiempo) y Actualizaciones de progreso (reportes con %).',
      },
    },
    {
      popover: {
        title: '¡Dominas la gestión de tareas! 🏆',
        description:
          'Ya conoces todas las acciones: editar datos, cambiar estado, delegar, adjuntar, comentar y eliminar. Cada acción queda registrada en el historial para trazabilidad completa.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  14. Meeting creation tour (admin + manager)                       */
/* ------------------------------------------------------------------ */
const meetingCreationTour: TutorialDef = {
  id: 'meeting-creation',
  title: 'Crear una reunión',
  description: 'Paso a paso para crear una reunión con todos sus datos.',
  icon: '📝',
  roles: [...ADMIN_ROLES, ...MANAGER_ROLES],
  startRoute: '/meetings/new',
  steps: [
    {
      popover: {
        title: 'Crear una reunión 📝',
        description:
          'Vamos a crear una nueva reunión paso a paso. Las reuniones te permiten registrar acuerdos y generar tareas directamente.',
      },
    },
    {
      element: '#meeting-create-form',
      popover: {
        title: 'Formulario de reunión',
        description:
          'Completa todos los campos del formulario. Título y fecha son obligatorios, los demás son opcionales pero recomendados.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#title',
      popover: {
        title: 'Título de la reunión',
        description:
          'Escribe un título descriptivo. Ejemplo: "Revisión semanal de avances" o "Comité de planificación Q4".',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#meeting_date',
      popover: {
        title: 'Fecha de la reunión',
        description:
          'Selecciona la fecha en que se realizó o realizará la reunión. Es obligatoria.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#classification',
      popover: {
        title: 'Clasificación',
        description:
          'Elige el tipo de reunión: Operativa (día a día), Estratégica (planificación), Seguimiento (avance de proyectos) o Revisión (evaluación de resultados).',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#area_id',
      popover: {
        title: 'Área vinculada',
        description:
          'Los managers tienen su área preseleccionada. Los administradores pueden elegir cualquier área o dejar sin área.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#notes',
      popover: {
        title: 'Notas de la reunión',
        description:
          'Registra la agenda, temas discutidos o comentarios relevantes. Estas notas quedarán en el registro de la reunión.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#meeting-create-submit',
      popover: {
        title: 'Crear reunión',
        description:
          'Al hacer clic se mostrará una confirmación. Una vez creada, podrás entrar a la reunión y agregar compromisos (tareas).',
        side: 'top',
        align: 'end',
      },
    },
    {
      popover: {
        title: '¡Reunión lista! 📅',
        description:
          'Después de crear la reunión, entra a su detalle para agregar compromisos. Los compromisos se convierten en tareas que se asignan y rastrean automáticamente.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  15. Meeting commitments / pendientes tour (admin + manager)       */
/* ------------------------------------------------------------------ */
const meetingCommitmentsTour: TutorialDef = {
  id: 'meeting-commitments',
  title: 'Compromisos de reunión',
  description: 'Aprende a crear tareas rápidas desde los acuerdos de una reunión (pendientes).',
  icon: '🤝',
  roles: [...ADMIN_ROLES, ...MANAGER_ROLES],
  startRoute: null,
  steps: [
    {
      popover: {
        title: 'Compromisos de reunión 🤝',
        description:
          'Los compromisos (pendientes) son tareas que nacen directamente de los acuerdos de una reunión. Vamos a ver cómo crearlos.',
      },
    },
    {
      popover: {
        title: 'Paso 1: Abre la reunión',
        description:
          'Desde el listado de reuniones, haz clic en cualquier reunión abierta para ver su detalle.',
      },
    },
    {
      popover: {
        title: 'Paso 2: Compromisos existentes',
        description:
          'En el detalle de la reunión verás la sección "Compromisos de esta reunión" con las tareas ya creadas, su estado y responsable asignado.',
      },
    },
    {
      popover: {
        title: 'Paso 3: Crear compromisos rápidos',
        description:
          'En la sección "Crear compromisos de reunión" puedes agregar múltiples tareas borrador. Cada una necesita un título, puedes asignar prioridad, responsable y fecha límite.',
      },
    },
    {
      popover: {
        title: 'Paso 4: Asignar responsable',
        description:
          'Puedes asignar tareas a miembros de tu área (aparecen primero) o a otras áreas del sistema. Si la reunión tiene un área vinculada, sus miembros se muestran agrupados.',
      },
    },
    {
      popover: {
        title: 'Paso 5: Opciones avanzadas de compromiso',
        description:
          'Cada compromiso puede requerir adjuntos, comentario obligatorio, aprobación del manager o reportes de progreso. Configúralos según la importancia del acuerdo.',
      },
    },
    {
      popover: {
        title: 'Paso 6: Enviar compromisos',
        description:
          'Cuando tengas todos los borradores listos, haz clic en "Crear todas las tareas". Se crearán en lote y aparecerán en el módulo de Tareas automáticamente.',
      },
    },
    {
      popover: {
        title: 'Paso 7: Cerrar la reunión',
        description:
          'Cuando todos los acuerdos estén registrados, puedes cerrar la reunión. Una vez cerrada, no se pueden agregar más compromisos.',
      },
    },
    {
      popover: {
        title: '¡Flujo completo! ✅',
        description:
          'Crear reunión → Registrar acuerdos → Crear compromisos como tareas → Cerrar reunión. Los compromisos quedan vinculados y se rastrean como cualquier otra tarea.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  16. Area creation tour (admin only)                               */
/* ------------------------------------------------------------------ */
const areaCreationTour: TutorialDef = {
  id: 'area-creation',
  title: 'Crear un área',
  description: 'Paso a paso para crear una nueva área organizacional.',
  icon: '🏗️',
  roles: [...ADMIN_ROLES],
  startRoute: '/areas/new',
  steps: [
    {
      popover: {
        title: 'Crear un área 🏗️',
        description:
          'Las áreas organizan tu equipo. Cada área tiene un manager, miembros y sus propias métricas de cumplimiento.',
      },
    },
    {
      element: '#area-create-form',
      popover: {
        title: 'Formulario de área',
        description:
          'Completa los datos del área. El nombre es obligatorio, los demás campos son opcionales pero recomendados.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#name',
      popover: {
        title: 'Nombre del área',
        description:
          'Un nombre descriptivo para el área. Ejemplo: "Tecnología", "Recursos Humanos", "Comercial".',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#description',
      popover: {
        title: 'Descripción',
        description:
          'Describe brevemente las funciones y responsabilidades del área.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#process_identifier',
      popover: {
        title: 'Identificador de proceso',
        description:
          'Un código corto que identifica el proceso del área en tus documentos internos. Ejemplo: "TI-001" o "RRHH".',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#manager_user_id',
      popover: {
        title: 'Encargado del área',
        description:
          'Selecciona al manager responsable. Solo aparecen usuarios con roles de gestión (gerente, director, líder, coordinador). El manager podrá ver las métricas y gestionar tareas del área.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: '¡Área lista! 🎉',
        description:
          'Después de crear el área, el manager asignado podrá reclamar trabajadores desde la sección "Mi equipo". Los trabajadores sin área aparecerán como disponibles.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  17. User creation tour (admin only)                               */
/* ------------------------------------------------------------------ */
const userCreationTour: TutorialDef = {
  id: 'user-creation',
  title: 'Crear un usuario',
  description: 'Aprende a crear nuevas cuentas de usuario con sus roles.',
  icon: '👤',
  roles: [...ADMIN_ROLES],
  startRoute: '/users',
  steps: [
    {
      popover: {
        title: 'Crear un usuario 👤',
        description:
          'Vamos a aprender cómo agregar nuevos usuarios al sistema. Cada usuario necesita nombre, email, contraseña y un rol asignado.',
      },
    },
    {
      element: '#user-create-btn',
      popover: {
        title: 'Botón de crear',
        description:
          'Haz clic en "Nuevo usuario" para abrir el formulario de creación. El formulario aparecerá directamente en la página.',
        side: 'left',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Campos del formulario',
        description:
          'Deberás completar: Nombre completo, Email (será su usuario de acceso), Contraseña (mínimo 6 caracteres) y Rol.',
      },
    },
    {
      popover: {
        title: 'Asignar rol',
        description:
          'El rol determina los permisos: Gerente (acceso global), Manager/Director/Líder/Coordinador (gestión de área), Trabajador/Analista (ejecución de tareas). Elige según las responsabilidades.',
      },
    },
    {
      popover: {
        title: 'Después de crear',
        description:
          'El usuario podrá iniciar sesión inmediatamente con su email y contraseña. Si necesita pertenecer a un área, el manager del área podrá reclamarlo.',
      },
    },
    {
      popover: {
        title: 'Gestionar usuarios existentes',
        description:
          'Puedes editar el rol, cambiar contraseña o desactivar/activar usuarios haciendo clic en el ícono de edición junto a cada usuario.',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Master list — order matters (welcome first)                       */
/* ------------------------------------------------------------------ */
export const ALL_TUTORIALS: TutorialDef[] = [
  welcomeTour,
  dashboardAdminTour,
  dashboardManagerTour,
  dashboardWorkerTour,
  tasksGeneralTour,
  taskCreationTour,
  taskEditingTour,
  taskWorkflowWorkerTour,
  taskApprovalTour,
  meetingsTour,
  meetingCreationTour,
  meetingCommitmentsTour,
  areasTour,
  areaCreationTour,
  usersTour,
  userCreationTour,
  teamClaimTour,
  settingsTour,
  consolidatedTour,
  notificationsTour,
];

/** Return only the tutorials visible for a given role slug */
export function getTutorialsForRole(role: RoleType): TutorialDef[] {
  return ALL_TUTORIALS.filter((t) => t.roles.includes(role));
}
