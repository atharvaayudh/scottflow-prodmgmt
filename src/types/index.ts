export type AppRole = 'admin' | 'production_manager' | 'production_team' | 'branding_partners' | 'factories' | 'jobwork_factories';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: AppRole;
  teamId?: string;
  createdAt: string;
}

export interface Permission {
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface RolePermissions {
  role: AppRole;
  permissions: Permission[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[]; // user IDs
}

export interface SystemConfig {
  logoHeader?: string;
  logoSidebar?: string;
  sidebarWidth: number;
}
