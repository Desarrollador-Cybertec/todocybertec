import type { Task } from '../types';

/**
 * Compare IDs safely — handles string/number coercion from backend.
 */
export function idsMatch(a: number | string | null | undefined, b: number | string | null | undefined): boolean {
  if (a == null || b == null) return false;
  return Number(a) === Number(b);
}

/**
 * Derive status progress percentage from task status string.
 */
export function statusProgress(status: string): number {
  if (status === 'completed') return 100;
  if (status === 'in_review') return 75;
  if (status === 'in_progress' || status === 'rejected' || status === 'overdue') return 25;
  return 0;
}

/**
 * Compute task progress (0–100) based on milestone completion:
 * started → comment (if required) → attachment (if required) → sent to review (if required) → completed
 * "completed" is always the last milestone so a running task never reaches 100%.
 */
export function taskProgress(task: Pick<Task, 'status' | 'requires_completion_comment' | 'requires_attachment' | 'requires_manager_approval' | 'comments' | 'attachments'>): number {
  const started = ['in_progress', 'in_review', 'completed', 'rejected', 'overdue'].includes(task.status);
  // Always add 1 for the final "completed" milestone so an in-progress task can never reach 100%.
  const totalSteps =
    1 +
    (task.requires_completion_comment ? 1 : 0) +
    (task.requires_attachment ? 1 : 0) +
    (task.requires_manager_approval ? 1 : 0) +
    1;
  let done = started ? 1 : 0;
  // If the task progressed to in_review or completed, previous requirements are implicitly satisfied.
  const pastInProgress = ['in_review', 'completed'].includes(task.status);
  if (task.requires_completion_comment && ((task.comments?.length ?? 0) > 0 || pastInProgress)) done++;
  if (task.requires_attachment && ((task.attachments?.length ?? 0) > 0 || pastInProgress)) done++;
  if (task.requires_manager_approval && pastInProgress) done++;
  if (task.status === 'completed') done++;
  return Math.round((done / totalSteps) * 100);
}

/**
 * Priority sort order — lower is more urgent.
 */
export const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};
