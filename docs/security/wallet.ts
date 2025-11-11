import { ApiClient } from '../ApiClient';
import { WalletBalanceResponse, SendMoneyPayload, SendMoneyResponse } from '../types/wallet';

/**
 * The Wallet service handles all wallet-related API calls,
 * such as retrieving balance and sending money.
 */
export class Wallet {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Retrieves the current balance for the authenticated user's wallet.
   * @returns A promise that resolves with the wallet balance details.
   */
  public async getBalance(): Promise<WalletBalanceResponse> {
    try {
      const response = await this.apiClient.request<WalletBalanceResponse>({
        method: 'GET',
        url: '/wallet/balance',
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to retrieve wallet balance: ${error.message}`);
    }
  }

  /**
   * Initiates a money transfer from the authenticated user's wallet to a recipient.
   * @param payload The details for the money transfer.
   * @returns A promise that resolves with the transfer status and transaction ID.
   */
  public async sendMoney(payload: SendMoneyPayload): Promise<SendMoneyResponse> {
    try {
      const response = await this.apiClient.request<SendMoneyResponse>({
        method: 'POST',
        url: '/wallet/send',
        data: payload,
      });
      return response;
    } catch (error: any) {
      // The API might return specific error codes for insufficient funds,
      // invalid recipient, etc. These should be parsed and re-thrown as
      // more specific SDK errors for better developer experience.
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(`Money transfer failed: ${error.response.data.message}`);
      }
      throw new Error(`Money transfer failed: ${error.message}`);
    }
  }
}