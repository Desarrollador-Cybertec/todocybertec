import { TaskStatus, ADMIN_ROLES, MANAGER_ROLES, WORKER_ROLES } from '../../../types/enums';
import type { Task } from '../../../types';

interface AuthUser {
  id: number;
  role: { slug: string };
  area_id?: number | null;
}

export function useTaskPermissions(task: Task | null, user: AuthUser | null) {
  const isSuperAdmin = user?.role.slug ? ADMIN_ROLES.includes(user.role.slug as Parameters<typeof ADMIN_ROLES.includes>[0]) : false;
  const isManager = user?.role.slug ? MANAGER_ROLES.includes(user.role.slug as Parameters<typeof MANAGER_ROLES.includes>[0]) : false;
  const isWorker = user?.role.slug ? WORKER_ROLES.includes(user.role.slug as Parameters<typeof WORKER_ROLES.includes>[0]) : false;
  const uid = Number(user?.id);

  const isResponsible =
    Number(task?.current_responsible_user_id) === uid ||
    Number(task?.current_responsible?.id) === uid ||
    Number(task?.assigned_to_user_id) === uid ||
    Number(task?.assigned_user?.id) === uid;

  const isCreator =
    Number(task?.created_by) === uid ||
    Number(task?.creator?.id) === uid;

  const terminal = [TaskStatus.COMPLETED as string, TaskStatus.CANCELLED as string];
  const isPersonalTask = !task?.area_id && !task?.assigned_to_area_id;
  const isActive = !terminal.includes(task?.status as string);
  const isAssignedToExternal = !!task?.external_email;

  const canDelete = isSuperAdmin || (isWorker && isCreator && isPersonalTask);

  const taskAssignedToSelf =
    (task?.assigned_to_user_id != null && Number(task.assigned_to_user_id) === uid) ||
    (task?.current_responsible_user_id != null && Number(task.current_responsible_user_id) === uid) ||
    (task?.current_responsible?.id != null && Number(task.current_responsible.id) === uid) ||
    (task?.assigned_user?.id != null && Number(task.assigned_user.id) === uid);

  const managerOwnsTask = isManager && !taskAssignedToSelf && (
    (!task?.assigned_to_area_id && !task?.area_id) ||
    Number(task?.area?.manager_user_id) === uid ||
    Number(task?.area?.manager?.id) === uid ||
    Number(task?.assigned_area?.manager_user_id) === uid ||
    Number(task?.assigned_area?.manager?.id) === uid ||
    (!!user?.area_id && (
      Number(task?.assigned_to_area_id) === Number(user.area_id) ||
      Number(task?.area_id) === Number(user.area_id)
    ))
  );

  const canDelegate = !terminal.includes(task?.status as string) && (isSuperAdmin || managerOwnsTask);
  const isParticipant = isResponsible || isCreator || isSuperAdmin || isManager;
  const canUpload = isParticipant && isActive && !!task?.requires_attachment;
  const canComment = isParticipant && isActive && !!task?.requires_completion_comment;
  const canEdit =
    ((isSuperAdmin || isManager) && isActive) ||
    (isWorker && isCreator && isPersonalTask && isActive) ||
    (isCreator && isAssignedToExternal && isActive);

  return {
    isSuperAdmin,
    isManager,
    isWorker,
    uid,
    isResponsible,
    isCreator,
    isActive,
    canDelete,
    canDelegate,
    canEdit,
    canUpload,
    canComment,
    isParticipant,
  };
}
