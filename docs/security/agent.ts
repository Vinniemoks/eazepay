import { ApiClient } from '../ApiClient';
import { CustomerLookupPayload, CustomerLookupResponse, AgentCashTransactionPayload, AgentCashTransactionResponse, AgentApiResponse } from '../types/agent';

/**
 * The Agent service handles agent-specific operations,
 * such as customer lookup and cash deposits/withdrawals.
 */
export class Agent {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Look up customer details using a phone number or account ID.
   * @param payload The customer identifier and its type.
   * @returns A promise that resolves with the customer details.
   */
  public async lookupCustomer(payload: CustomerLookupPayload): Promise<CustomerLookupResponse> {
    try {
      const response = await this.apiClient.request<CustomerLookupResponse>({
        method: 'POST',
        url: '/agents/customers/lookup',
        data: payload,
      });
      return response;
    } catch (error: any) {
      // The API might return specific error codes for customer not found,
      // invalid identifier, etc. These should be parsed and re-thrown as
      // more specific SDK errors for better developer experience.
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(`Customer lookup failed: ${error.response.data.message}`);
      }
      throw new Error(`Customer lookup failed: ${error.message}`);
    }
  }

  /**
   * Creates a cash deposit or withdrawal transaction initiated by an agent.
   * @param payload The details for the cash transaction.
   * @returns A promise that resolves with the transaction status and ID.
   */
  public async createCashTransaction(payload: AgentCashTransactionPayload): Promise<AgentCashTransactionResponse> {
    try {
      const response = await this.apiClient.request<AgentCashTransactionResponse>({
        method: 'POST
        url: '/agents/transactions/cash',
        data: payload,
      });
      return response;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(`Cash transaction failed: ${error.response.data.message}`);
      }
      throw new Error(`Cash transaction failed: ${error.message}`);
    }
  }
}