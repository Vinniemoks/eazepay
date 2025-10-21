import { apiClient } from './client';

export interface SystemHealth {
  overall: number;
  services: Array<{
    name: string;
    status: 'operational' | 'degraded' | 'down';
    uptime: number;
  }>;
  apiResponseTime: number;
  errorRate: number;
  activeUsers: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'MANAGER' | 'EMPLOYEE';
  department: string;
  status: 'ACTIVE' | 'SUSPENDED';
  permissions: string[];
  lastActive: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  role: 'MANAGER' | 'EMPLOYEE';
  department: string;
  permissions: string[];
  managerId?: string;
}

export interface SystemConfig {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  fees: {
    send: number;
    withdrawal: number;
    deposit: number;
  };
  limits: {
    daily: number;
    monthly: number;
    min: number;
    max: number;
  };
  security: {
    sessionTimeout: number;
    require2FA: boolean;
    passwordMinLength: number;
  };
  integrations: {
    mpesaEnabled: boolean;
    bankTransferEnabled: boolean;
  };
}

export interface Analytics {
  userGrowth: {
    current: number;
    previous: number;
    change: number;
  };
  transactionVolume: {
    current: number;
    previous: number;
    change: number;
  };
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  activeUsers: {
    current: number;
    previous: number;
    change: number;
  };
  topAgents: Array<{
    id: string;
    name: string;
    transactions: number;
    revenue: number;
  }>;
  transactionBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

class SuperuserApi {
  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    return apiClient.get('/superuser/system/health');
  }

  async getSystemAlerts() {
    return apiClient.get('/superuser/system/alerts');
  }

  // Admin Management
  async getAdmins(params?: any) {
    return apiClient.get('/superuser/admins', params);
  }

  async getAdminById(adminId: string): Promise<Admin> {
    return apiClient.get(`/superuser/admins/${adminId}`);
  }

  async createAdmin(data: CreateAdminRequest) {
    return apiClient.post('/superuser/admins', data);
  }

  async updateAdmin(adminId: string, data: Partial<CreateAdminRequest>) {
    return apiClient.put(`/superuser/admins/${adminId}`, data);
  }

  async suspendAdmin(adminId: string, reason: string) {
    return apiClient.post(`/superuser/admins/${adminId}/suspend`, { reason });
  }

  async activateAdmin(adminId: string) {
    return apiClient.post(`/superuser/admins/${adminId}/activate`);
  }

  // System Configuration
  async getConfig(): Promise<SystemConfig> {
    return apiClient.get('/superuser/config');
  }

  async updateConfig(config: Partial<SystemConfig>) {
    return apiClient.put('/superuser/config', config);
  }

  // Analytics
  async getAnalytics(period: '7d' | '30d' | '90d' | '1y'): Promise<Analytics> {
    return apiClient.get('/superuser/analytics', { period });
  }

  async exportReport(type: string, params?: any) {
    return apiClient.get(`/superuser/reports/${type}`, params);
  }

  // Audit Logs
  async getAuditLogs(params?: any) {
    return apiClient.get('/superuser/audit-logs', params);
  }

  // Dashboard
  async getDashboardStats() {
    return apiClient.get('/superuser/dashboard/stats');
  }
}

export const superuserApi = new SuperuserApi();
