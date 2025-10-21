import { apiClient } from './client';

export interface AgentRegistrationRequest {
  businessName: string;
  registrationNumber: string;
  businessType: string;
  location: string;
  ownerName: string;
  ownerIdNumber: string;
  ownerPhone: string;
  ownerEmail: string;
}

export interface AgentDocumentsRequest {
  businessLicense: string; // base64 or file
  ownerIdFront: string;
  ownerIdBack: string;
  premisesPhoto: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  status: 'active' | 'suspended';
}

export interface DepositRequest {
  customerId: string;
  amount: number;
  customerPin: string;
}

export interface DepositResponse {
  success: boolean;
  transactionId: string;
  commission: number;
  newBalance: number;
  reference: string;
}

export interface FloatBalance {
  balance: number;
  lowBalanceThreshold: number;
  isLow: boolean;
}

class AgentApi {
  async register(data: AgentRegistrationRequest) {
    return apiClient.post('/agents/register', data);
  }

  async uploadDocuments(agentId: string, documents: AgentDocumentsRequest) {
    const formData = new FormData();
    Object.entries(documents).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return apiClient.upload(`/agents/${agentId}/documents`, formData);
  }

  async getApplicationStatus(agentId: string) {
    return apiClient.get(`/agents/${agentId}/status`);
  }

  async lookupCustomer(phoneOrId: string): Promise<Customer> {
    return apiClient.get(`/agents/customers/${phoneOrId}`);
  }

  async depositCash(data: DepositRequest): Promise<DepositResponse> {
    return apiClient.post('/agents/deposit', data);
  }

  async withdrawCash(data: DepositRequest): Promise<DepositResponse> {
    return apiClient.post('/agents/withdraw', data);
  }

  async getFloatBalance(): Promise<FloatBalance> {
    return apiClient.get('/agents/float/balance');
  }

  async requestFloatTopUp(amount: number) {
    return apiClient.post('/agents/float/top-up', { amount });
  }

  async getDashboardStats() {
    return apiClient.get('/agents/dashboard/stats');
  }

  async getTransactions(params?: any) {
    return apiClient.get('/agents/transactions', params);
  }
}

export const agentApi = new AgentApi();
