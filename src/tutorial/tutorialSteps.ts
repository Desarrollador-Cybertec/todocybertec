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
  /** Route where the tutorial starts (null = run on current page) */
  startRoute: string | null;
  /** Module slug used to decide in which pages this tutorial appears in the menu.
   *  Derived from startRoute when omitted. Use this when startRoute is null
   *  but the tutorial belongs to a specific module (e.g. task detail). */
  module?: string;
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
  module: 'tasks',
  steps: [
    {
      popover: {
        title: 'Tu flujo de trabajo diario 🔄',
        description:
          'Como trabajador/analista tu ciclo es: ver tareas asignadas → iniciar → reportar avance → enviar a revisión. Este tutorial te muestra cada paso desde el detalle de una tarea.',
      },
    },
    {
      element: '#task-detail-header',
      popover: {
        title: 'Paso 1: Estado actual',
        description:
          'El badge de estado te indica en qué punto está la tarea. Si dice "Pendiente", está lista para que la inicies. Usa el selector de estado para hacer la transición.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#task-detail-actions',
      popover: {
        title: 'Paso 2: Iniciar la tarea',
        description:
          'Desde la barra de acciones cambia el estado a "En progreso". La tarea quedará activa y podrás empezar a trabajar en ella.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#task-upload-btn',
      popover: {
        title: 'Paso 3: Subir evidencia 📎',
        description:
          'Adjunta archivos de evidencia de tu trabajo (capturas, documentos, etc.). Si la tarea requiere adjunto obligatorio, debes subir al menos uno antes de enviar a revisión.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#task-comment-btn',
      popover: {
        title: 'Paso 4: Reportar avance 💬',
        description:
          'Deja comentarios con tu progreso. Tu manager y el creador pueden verlos. Es buena práctica actualizar el avance regularmente.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#task-detail-actions',
      popover: {
        title: 'Paso 5: Enviar a revisión',
        description:
          'Cuando termines, cambia el estado a "En revisión". Tu manager recibirá una notificación y revisará tu trabajo. Si la tarea no requiere aprobación, puedes completarla directamente.',
        side: 'top',
        align: 'start',
      },
    },
    {
      popover: {
        title: '¡Ya sabes el flujo! ✅',
        description:
          'Pendiente → En progreso → Subir evidencia → Enviar a revisión → Completada. Revisa tus notificaciones para ver el feedback de tu manager.',
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
  module: 'tasks',
  steps: [
    {
      popover: {
        title: 'Flujo de aprobación ✅',
        description:
          'Cuando alguien de tu equipo envía una tarea a revisión, recibirás una notificación. Abre la tarea para revisarla desde aquí.',
      },
    },
    {
      element: '#task-detail-header',
      popover: {
        title: 'Revisar estado y descripción',
        description:
          'Verifica que el estado sea "En revisión". Lee la descripción completa para entender qué se pedía. El badge de prioridad te indica la urgencia.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#task-detail-info',
      popover: {
        title: 'Verificar responsable y fechas',
        description:
          'Comprueba quién realizó la tarea, la fecha límite y la barra de progreso. Si hay archivos adjuntos y comentarios los verás en las secciones inferiores.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#task-detail-actions',
      popover: {
        title: 'Aprobar o rechazar',
        description:
          'Usa el selector de estado para aprobar (la tarea se completa) o rechazar (vuelve al trabajador). Al rechazar, agrega un comentario explicando qué falta — el trabajador lo recibirá como notificación.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#task-delegate-btn',
      popover: {
        title: 'Reasignar si es necesario',
        description:
          'Si la tarea debe ser realizada por otra persona, delégala antes de aprobar. El historial registra el cambio de responsable.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: '¡Flujo de aprobación completo! ✅',
        description:
          'Revisar adjuntos y comentarios → Aprobar o rechazar con nota → El trabajador recibe la notificación. Las tareas canceladas o reabiertras también quedan en el historial.',
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
  startRoute: '/dashboard',
  steps: [
    {
      popover: {
        title: 'Sistema de Notificaciones 🔔',
        description:
          'El sistema te notifica en tiempo real sobre tareas asignadas, cambios de estado, vencimientos y más. Veamos cómo funciona.',
      },
    },
    {
      element: '#notification-bell-btn',
      onHighlightStarted: () => {
        // Cierra el panel si ya estaba abierto para que quede bien posicionado
        const panel = document.getElementById('notification-list');
        if (panel) {
          const bell = document.getElementById('notification-bell-btn');
          if (bell) bell.click();
        }
      },
      popover: {
        title: 'Campana de notificaciones 🔔',
        description:
          'El número en rojo indica notificaciones no leídas. Haz clic para abrir el panel con el historial completo. El contador se actualiza automáticamente en tiempo real.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '#notification-bell-btn',
      onHighlightStarted: () => {
        // Abre el panel si aún está cerrado
        const panel = document.getElementById('notification-list');
        if (!panel) {
          const bell = document.getElementById('notification-bell-btn');
          if (bell) bell.click();
        }
      },
      popover: {
        title: 'Panel de notificaciones',
        description:
          'Al abrir la campana verás el historial con tres pestañas: "Todas", "Organización" (avisos globales y resúmenes) y "Personal" (eventos de tus tareas).',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '#notification-tabs',
      popover: {
        title: 'Filtrar por categoría',
        description:
          '"Todas" muestra el historial completo. "Organización" filtra avisos globales. "Personal" muestra solo los eventos de tus tareas.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '#notification-list',
      popover: {
        title: 'Lista de notificaciones',
        description:
          'Cada notificación muestra el tipo, descripción y fecha. Las no leídas tienen fondo resaltado. Haz clic en una para ir directamente a la tarea relacionada.',
        side: 'top',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'Notificaciones en tiempo real ✅',
        description:
          'Recibirás notificaciones de: nuevas asignaciones, tareas en revisión, aprobaciones/rechazos, vencimientos y alertas de inactividad. También aparecen toasts emergentes para no perderte nada.',
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
  startRoute: '/tasks/create',
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
      element: '#task-field-responsible',
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
      element: '#task-advanced-toggle',
      onDeselected: () => {
        // Expand advanced section only if not already open
        const isOpen = !!document.getElementById('task-create-details');
        if (!isOpen) {
          const btn = document.getElementById('task-create-advanced-btn');
          if (btn) btn.click();
        }
      },
      popover: {
        title: '5. Opciones avanzadas',
        description:
          'Expande esta sección para acceder a descripción detallada, asignación por área, vincular con reuniones, requisitos de cumplimiento y configuración de notificaciones. Al presionar Siguiente se expandirá automáticamente.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#task-create-preview',
      onHighlightStarted: () => {
        // Open advanced only if not already open
        const isOpen = !!document.getElementById('task-create-details');
        if (!isOpen) {
          const btn = document.getElementById('task-create-advanced-btn');
          if (btn) btn.click();
        }
      },
      popover: {
        title: 'Vista previa en tiempo real',
        description:
          'En la barra lateral derecha ves cómo quedará tu tarea mientras la creas: título, prioridad, responsable, fecha y requisitos activos. También encontrarás consejos útiles.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '#task-create-details',
      onHighlightStarted: () => {
        const isOpen = !!document.getElementById('task-create-details');
        if (!isOpen) document.getElementById('task-create-advanced-btn')?.click();
      },
      popover: {
        title: 'Opciones avanzadas: Detalles adicionales 📋',
        description:
          'Aquí puedes agregar una descripción detallada de la tarea, fecha de inicio, y vincular la tarea con una reunión existente (solo para managers/admin).',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#task-create-alt-assignment',
      onHighlightStarted: () => {
        const isOpen = !!document.getElementById('task-create-details');
        if (!isOpen) document.getElementById('task-create-advanced-btn')?.click();
      },
      popover: {
        title: 'Opciones avanzadas: Asignación alternativa 🔀',
        description:
          'Si eres manager o admin, puedes asignar la tarea a un área completa (cualquier miembro podrá reclamarla) o a un correo externo (persona fuera del sistema). Solo una opción de asignación puede estar activa.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#task-create-requirements',
      onHighlightStarted: () => {
        const isOpen = !!document.getElementById('task-create-details');
        if (!isOpen) document.getElementById('task-create-advanced-btn')?.click();
      },
      popover: {
        title: 'Opciones avanzadas: Requisitos ✅',
        description:
          'Configura qué necesita la tarea para completarse: "Requiere adjunto" obliga a subir evidencia, "Comentario de cierre" exige una nota al completar, "Aprobación del jefe" envía la tarea a revisión del manager antes de cerrarla.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#task-create-notifications',
      onHighlightStarted: () => {
        const isOpen = !!document.getElementById('task-create-details');
        if (!isOpen) document.getElementById('task-create-advanced-btn')?.click();
      },
      popover: {
        title: 'Opciones avanzadas: Notificaciones 🔔',
        description:
          'Personaliza los avisos: "Al vencer" avisa el día del vencimiento, "Si vencida" alerta cuando pasa la fecha, "Al completar" notifica cuando la tarea se cierra. Actívalos según la importancia.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#task-create-submit',
      popover: {
        title: '6. Crear la tarea',
        description:
          'Haz clic en el botón "Crear tarea". Se abrirá un modal de confirmación mostrando el título. Confirma para crear o vuelve a revisar los datos.',
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
  module: 'tasks',
  steps: [
    {
      popover: {
        title: 'Detalle de tarea 🛠️',
        description:
          'Estás en el detalle de una tarea. Aquí puedes editar datos, cambiar estado, delegar, adjuntar archivos y dejar comentarios. Veamos cada sección.',
      },
    },
    {
      element: '#task-detail-header',
      popover: {
        title: 'Encabezado de la tarea',
        description:
          'Aquí ves el título, descripción y los badges de estado y prioridad. El estado se puede cambiar desde el selector desplegable que aparece en esta sección.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#task-detail-info',
      popover: {
        title: 'Información detallada',
        description:
          'Este grid muestra: creador, responsable actual, área, fecha límite, barra de avance y antigüedad. Toda la trazabilidad de la tarea en un vistazo.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#task-detail-actions',
      popover: {
        title: 'Barra de acciones',
        description:
          'Las acciones disponibles se adaptan a tu rol y al estado actual de la tarea. Solo verás lo que puedes hacer en este momento.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '#task-edit-btn',
      popover: {
        title: 'Editar tarea ✏️',
        description:
          'Haz clic aquí para activar el modo edición inline. Podrás modificar título, descripción, prioridad, requisitos y notificaciones sin salir del detalle.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#task-delegate-btn',
      popover: {
        title: 'Delegar tarea 🔄',
        description:
          'Reasigna la tarea a otro miembro. Selecciona al nuevo responsable y agrega una nota. El historial registra la delegación con fecha y motivo.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#task-upload-btn',
      popover: {
        title: 'Adjuntar archivos 📎',
        description:
          'Sube archivos de evidencia o soporte (máx. 20 MB). Los adjuntos aparecen como tarjetas con vista previa y son visibles para todos los participantes.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#task-comment-btn',
      popover: {
        title: 'Comentar 💬',
        description:
          'Deja notas sobre el avance o cualquier aclaración. Los comentarios quedan en el historial y son visibles para creador, responsable y manager del área.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: '¡Dominas la gestión de tareas! 🏆',
        description:
          'Editar, cambiar estado, delegar, adjuntar y comentar — cada acción queda registrada en el historial para trazabilidad completa.',
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
  startRoute: '/meetings/create',
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
  description: 'Aprende a crear tareas rápidas desde los acuerdos de una reunión.',
  icon: '🤝',
  roles: [...ADMIN_ROLES, ...MANAGER_ROLES],
  startRoute: null,
  module: 'meetings',
  steps: [
    {
      popover: {
        title: 'Compromisos de reunión 🤝',
        description:
          'Desde el detalle de una reunión puedes registrar los acuerdos como tareas rastreables. Veamos cada sección.',
      },
    },
    {
      element: '#meeting-detail-header',
      popover: {
        title: 'Información de la reunión',
        description:
          'Aquí ves el título, fecha, clasificación, área y notas. El botón "Editar" permite modificar estos datos mientras la reunión esté abierta. "Cerrar reunión" congela los datos cuando todo está listo.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Compromisos ya creados',
        description:
          'Si la reunión ya tiene compromisos, verás una sección con las tareas vinculadas: su estado, prioridad y responsable. Haz clic en cualquiera para abrir su detalle completo.',
      },
    },
    {
      element: '#meeting-commitments-section',
      popover: {
        title: 'Crear nuevos compromisos',
        description:
          'Aquí creas los acuerdos de la reunión como tareas borrador. Puedes agregar varios antes de guardarlos todos en lote.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#meeting-add-commitment-btn',
      popover: {
        title: 'Agregar compromiso',
        description:
          'Haz clic aquí para abrir el formulario de un nuevo compromiso. Cada uno lleva título, responsable, prioridad y fecha límite opcional.',
        side: 'top',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Guardar todos los compromisos',
        description:
          'Una vez que tengas borradores listos, aparece el botón "Guardar compromisos (N)". Los crea en lote y aparecen inmediatamente en el módulo de Tareas vinculados a esta reunión.',
      },
    },
    {
      popover: {
        title: '¡Flujo completo! ✅',
        description:
          'Agregar compromisos → Guardar en lote → Cerrar reunión. Los compromisos quedan vinculados y se rastrean como cualquier otra tarea del sistema.',
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
