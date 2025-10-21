import { apiClient } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'AGENT';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  registeredDate: string;
}

export interface GetUsersParams {
  search?: string;
  status?: User['status'];
  kycStatus?: User['kycStatus'];
  page?: number;
  limit?: number;
}

export interface Agent {
  id: string;
  businessName: string;
  ownerName: string;
  location: string;
  phone: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  performance: number;
  commission: number;
  registeredDate: string;
}

class AdminApi {
  // User Management
  async getUsers(params?: GetUsersParams) {
    return apiClient.get('/admin/users', params);
  }

  async getUserById(userId: string) {
    return apiClient.get(`/admin/users/${userId}`);
  }

  async approveKYC(userId: string, notes?: string) {
    return apiClient.post(`/admin/users/${userId}/kyc/approve`, { notes });
  }

  async rejectKYC(userId: string, reason: string) {
    return apiClient.post(`/admin/users/${userId}/kyc/reject`, { reason });
  }

  async suspendUser(userId: string, reason: string) {
    return apiClient.post(`/admin/users/${userId}/suspend`, { reason });
  }

  async activateUser(userId: string) {
    return apiClient.post(`/admin/users/${userId}/activate`);
  }

  async resetPassword(userId: string) {
    return apiClient.post(`/admin/users/${userId}/reset-password`);
  }

  // Transaction Monitoring
  async getTransactions(params?: any) {
    return apiClient.get('/admin/transactions', params);
  }

  async getTransactionById(transactionId: string) {
    return apiClient.get(`/admin/transactions/${transactionId}`);
  }

  async flagTransaction(transactionId: string, reason: string) {
    return apiClient.post(`/admin/transactions/${transactionId}/flag`, { reason });
  }

  async reverseTransaction(transactionId: string, reason: string) {
    return apiClient.post(`/admin/transactions/${transactionId}/reverse`, { reason });
  }

  // Agent Management
  async getAgents(params?: any) {
    return apiClient.get('/admin/agents', params);
  }

  async getAgentById(agentId: string) {
    return apiClient.get(`/admin/agents/${agentId}`);
  }

  async approveAgent(agentId: string, commissionRate: number) {
    return apiClient.post(`/admin/agents/${agentId}/approve`, { commissionRate });
  }

  async rejectAgent(agentId: string, reason: string) {
    return apiClient.post(`/admin/agents/${agentId}/reject`, { reason });
  }

  async suspendAgent(agentId: string, reason: string) {
    return apiClient.post(`/admin/agents/${agentId}/suspend`, { reason });
  }

  async updateCommission(agentId: string, commissionRate: number) {
    return apiClient.put(`/admin/agents/${agentId}/commission`, { commissionRate });
  }

  // Dashboard
  async getDashboardStats() {
    return apiClient.get('/admin/dashboard/stats');
  }

  async exportReport(type: string, params?: any) {
    return apiClient.get(`/admin/reports/${type}`, params);
  }
}

export const adminApi = new AdminApi();
