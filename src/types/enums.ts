export const TaskStatus = {
  DRAFT: 'draft',
  PENDING_ASSIGNMENT: 'pending_assignment',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue',
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];

export const Role = {
  SUPERADMIN: 'superadmin',
  GERENTE: 'gerente',
  AREA_MANAGER: 'area_manager',
  DIRECTOR: 'director',
  LEADER: 'leader',
  COORDINATOR: 'coordinator',
  WORKER: 'worker',
  ANALYST: 'analyst',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

/** Roles with Admin-level access (global scope) */
export const ADMIN_ROLES: RoleType[] = [Role.SUPERADMIN, Role.GERENTE];
/** Roles with Manager-level access (area scope) */
export const MANAGER_ROLES: RoleType[] = [Role.AREA_MANAGER, Role.DIRECTOR, Role.LEADER, Role.COORDINATOR];
/** Roles with Worker-level access */
export const WORKER_ROLES: RoleType[] = [Role.WORKER, Role.ANALYST];

export const CommentType = {
  COMMENT: 'comment',
  PROGRESS: 'progress',
  COMPLETION_NOTE: 'completion_note',
  REJECTION_NOTE: 'rejection_note',
  CANCELLATION_NOTE: 'cancellation_note',
  REOPEN_NOTE: 'reopen_note',
  SYSTEM: 'system',
} as const;

export type CommentTypeValue = (typeof CommentType)[keyof typeof CommentType];

export const AttachmentType = {
  EVIDENCE: 'evidence',
  SUPPORT: 'support',
  FINAL_DELIVERY: 'final_delivery',
} as const;

export type AttachmentTypeValue = (typeof AttachmentType)[keyof typeof AttachmentType];

export const UpdateType = {
  PROGRESS: 'progress',
  EVIDENCE: 'evidence',
  NOTE: 'note',
} as const;

export type UpdateTypeValue = (typeof UpdateType)[keyof typeof UpdateType];

export const MeetingClassification = {
  STRATEGIC: 'strategic',
  OPERATIONAL: 'operational',
  FOLLOW_UP: 'follow_up',
  REVIEW: 'review',
  OTHER: 'other',
} as const;

export type MeetingClassificationType = (typeof MeetingClassification)[keyof typeof MeetingClassification];

export const TASK_STATUS_LABELS: Record<TaskStatusType, string> = {
  draft: 'Borrador',
  pending_assignment: 'Pendiente de asignación',
  pending: 'Pendiente',
  in_progress: 'En progreso',
  in_review: 'En revisión',
  completed: 'Completada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  overdue: 'Vencida',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriorityType, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

export const ROLE_LABELS: Record<RoleType, string> = {
  superadmin: 'Super Administrador',
  gerente: 'Gerente',
  area_manager: 'Encargado de Área',
  director: 'Director',
  leader: 'Líder',
  coordinator: 'Coordinador',
  worker: 'Trabajador',
  analyst: 'Analista',
};

export const MEETING_CLASSIFICATION_LABELS: Record<MeetingClassificationType, string> = {
  strategic: 'Estratégica',
  operational: 'Operativa',
  follow_up: 'Seguimiento',
  review: 'Revisión',
  other: 'Otra',
};
