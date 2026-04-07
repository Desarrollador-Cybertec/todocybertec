export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'integer' | 'boolean';
  group: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingRequest {
  value: string;
}

export interface MessageTemplate {
  id: number;
  name: string;
  slug: string;
  subject: string;
  body: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateMessageTemplateRequest {
  subject?: string;
  body?: string;
  active?: boolean;
}

export interface RoleInfo {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  is_configurable: boolean;
  users_count: number;
}

export interface ToggleRoleResponse {
  message: string;
  role: RoleInfo;
}
