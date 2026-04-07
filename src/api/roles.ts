import { apiClient } from './client';
import type { RoleInfo, ToggleRoleResponse } from '../types';

export const rolesApi = {
  list: () => apiClient.get<RoleInfo[]>('/roles'),

  toggleActive: (id: number) =>
    apiClient.patch<ToggleRoleResponse>(`/roles/${id}/toggle-active`),
};
