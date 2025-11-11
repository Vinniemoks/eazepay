import { Auth } from './services/Auth';
import { Transactions } from './services/Transactions';
import { Wallet } from './services/Wallet';
import { Agent } from './services/Agent';
import { ApiClient } from './ApiClient';

export interface EazepayConfig {
  apiKey: string;
  baseUrl?: string;
}

export class Eazepay {
  public auth: Auth;
  public transactions: Transactions;
  public wallet: Wallet;
  public agent: Agent;
  private apiClient: ApiClient;

  /**
   * Initializes a new instance of the Eazepay SDK.
   * @param config Configuration object with the API key and optional base URL.
   */
  constructor(config: EazepayConfig) {
    if (!config.apiKey) {
      throw new Error('Eazepay SDK: API key is required.');
    }

    this.apiClient = new ApiClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.eazepay.com/v1',
    });

    this.auth = new Auth(this.apiClient);
    this.transactions = new Transactions(this.apiClient);
    this.wallet = new Wallet(this.apiClient);
    this.agent = new Agent(this.apiClient);
  }
}