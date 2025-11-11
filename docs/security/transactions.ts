import { ApiClient } from '../ApiClient';
import { CreateTransactionPayload, TransactionResponse, ListTransactionsQueryParams, TransactionListResponse } from '../types/transactions';

/**
 * The Transactions service handles all transaction-related API calls.
 */
export class Transactions {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Creates a new transaction.
   * @param payload The transaction data.
   * @returns A promise that resolves with the created transaction response.
   */
  public async create(payload: CreateTransactionPayload): Promise<TransactionResponse> {
    try {
      const response = await this.apiClient.request<TransactionResponse>({
        method: 'POST',
        url: '/transactions',
        data: payload,
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  /**
   * Retrieves a single transaction by its ID.
   * @param transactionId The ID of the transaction to retrieve.
   * @returns A promise that resolves with the transaction details.
   */
  public async get(transactionId: string): Promise<TransactionResponse> {
    try {
      const response = await this.apiClient.request<TransactionResponse>({
        method: 'GET',
        url: `/transactions/${transactionId}`,
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to retrieve transaction ${transactionId}: ${error.message}`);
    }
  }

  /**
   * Lists transactions, optionally filtered by user ID, status, and pagination.
   * @param params Query parameters for filtering and pagination.
   * @returns A promise that resolves with a list of transactions and their count.
   */
  public async list(params?: ListTransactionsQueryParams): Promise<TransactionListResponse> {
    try {
      const response = await this.apiClient.request<TransactionListResponse>({
        method: 'GET',
        url: '/transactions',
        params: params,
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to list transactions: ${error.message}`);
    }
  }
}