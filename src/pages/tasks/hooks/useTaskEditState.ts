import { useState, useCallback } from 'react';
import { tasksApi } from '../../../api/tasks';
import { ApiError } from '../../../api/client';
import type { Task } from '../../../types';

export interface EditFields {
  title: string;
  description: string;
  priority: string;
  requiresAttachment: boolean;
  requiresComment: boolean;
  requiresApproval: boolean;
  requiresNotification: boolean;
  requiresDueDate: boolean;
  notifyDue: boolean;
  notifyOverdue: boolean;
  notifyCompletion: boolean;
}

function taskToEditFields(task: Task): EditFields {
  return {
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    requiresAttachment: task.requires_attachment,
    requiresComment: task.requires_completion_comment,
    requiresApproval: task.requires_manager_approval,
    requiresNotification: task.requires_completion_notification,
    requiresDueDate: task.requires_due_date,
    notifyDue: task.notify_on_due,
    notifyOverdue: task.notify_on_overdue,
    notifyCompletion: task.notify_on_completion,
  };
}

const EMPTY_FIELDS: EditFields = {
  title: '',
  description: '',
  priority: '',
  requiresAttachment: false,
  requiresComment: false,
  requiresApproval: false,
  requiresNotification: false,
  requiresDueDate: false,
  notifyDue: false,
  notifyOverdue: false,
  notifyCompletion: false,
};

export function useTaskEditState(
  task: Task | null,
  taskId: number,
  onSuccess: (msg: string) => void,
  onError: (msg: string) => void,
  onSaved: () => void,
) {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState<EditFields>(EMPTY_FIELDS);
  const [saving, setSaving] = useState(false);

  const startEditing = useCallback((source?: Task) => {
    const t = source ?? task;
    if (!t) return;
    setFields(taskToEditFields(t));
    setEditing(true);
  }, [task]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
  }, []);

  const updateField = useCallback(<K extends keyof EditFields>(key: K, value: EditFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveEdit = useCallback(async () => {
    if (!task) return;
    setSaving(true);
    try {
      const updates: Record<string, string | boolean> = {};
      if (fields.title !== task.title) updates.title = fields.title;
      if ((fields.description || '') !== (task.description || '')) updates.description = fields.description;
      if (fields.priority !== task.priority) updates.priority = fields.priority;
      if (fields.requiresAttachment !== task.requires_attachment) updates.requires_attachment = fields.requiresAttachment;
      if (fields.requiresComment !== task.requires_completion_comment) updates.requires_completion_comment = fields.requiresComment;
      if (fields.requiresApproval !== task.requires_manager_approval) updates.requires_manager_approval = fields.requiresApproval;
      if (fields.requiresNotification !== task.requires_completion_notification) updates.requires_completion_notification = fields.requiresNotification;
      if (fields.requiresDueDate !== task.requires_due_date) updates.requires_due_date = fields.requiresDueDate;
      if (fields.notifyDue !== task.notify_on_due) updates.notify_on_due = fields.notifyDue;
      if (fields.notifyOverdue !== task.notify_on_overdue) updates.notify_on_overdue = fields.notifyOverdue;
      if (fields.notifyCompletion !== task.notify_on_completion) updates.notify_on_completion = fields.notifyCompletion;
      if (Object.keys(updates).length > 0) {
        await tasksApi.update(taskId, updates);
        onSuccess('Tarea actualizada');
        onSaved();
      }
      setEditing(false);
    } catch (error) {
      onError(error instanceof ApiError ? error.data.message : 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }, [task, fields, taskId, onSuccess, onError, onSaved]);

  return { editing, fields, saving, startEditing, cancelEditing, updateField, saveEdit };
}
