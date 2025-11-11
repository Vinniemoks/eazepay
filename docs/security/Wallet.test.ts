import { Eazepay } from '../Eazepay';
import { mock } from '../__mocks__/ApiClient';
import { WalletBalanceResponse, SendMoneyPayload, SendMoneyResponse } from '../types/wallet';

// Mock the ApiClient module
jest.mock('../ApiClient');

describe('Wallet Service', () => {
  let eazepay: Eazepay;
  const API_KEY = 'test_api_key';
  const BASE_URL = 'http://localhost:8000/api';

  beforeEach(() => {
    eazepay = new Eazepay({ apiKey: API_KEY, baseUrl: BASE_URL });
    mock.reset(); // Reset mock adapter before each test
  });

  // --- Get Balance Tests ---
  it('should successfully retrieve wallet balance', async () => {
    const balanceResponse: WalletBalanceResponse = {
      userId: 'user_123',
      balance: 1500.75,
      currency: 'KES',
      lastUpdated: new Date().toISOString(),
    };

    mock.onGet(`${BASE_URL}/wallet/balance`).reply(200, balanceResponse);

    const result = await eazepay.wallet.getBalance();
    expect(result).toEqual(balanceResponse);
  });

  it('should throw an error if retrieving balance fails', async () => {
    mock.onGet(`${BASE_URL}/wallet/balance`).reply(500, { message: 'Database error' });

    await expect(eazepay.wallet.getBalance()).rejects.toThrow('Failed to retrieve wallet balance: Request failed with status code 500');
  });

  // --- Send Money Tests ---
  it('should successfully send money', async () => {
    const sendMoneyPayload: SendMoneyPayload = {
      recipientId: 'user_rec456',
      amount: 500,
      currency: 'KES',
      description: 'Gift',
    };
    const sendMoneyResponse: SendMoneyResponse = {
      transactionId: 'txn_xyz789',
      status: 'completed',
      message: 'Money sent successfully',
      newBalance: 1000.75,
      currency: 'KES',
    };

    mock.onPost(`${BASE_URL}/wallet/send`).reply(200, sendMoneyResponse);

    const result = await eazepay.wallet.sendMoney(sendMoneyPayload);
    expect(result).toEqual(sendMoneyResponse);
  });

  it('should throw an error if sending money fails due to insufficient funds', async () => {
    const sendMoneyPayload: SendMoneyPayload = {
      recipientId: 'user_rec456',
      amount: 50000,
      currency: 'KES',
    };

    mock.onPost(`${BASE_URL}/wallet/send`).reply(400, { message: 'Insufficient funds' });

    await expect(eazepay.wallet.sendMoney(sendMoneyPayload)).rejects.toThrow('Money transfer failed: Insufficient funds');
  });

  it('should throw a generic error if sending money fails with an unknown error', async () => {
    const sendMoneyPayload: SendMoneyPayload = { recipientId: 'user_rec456', amount: 100, currency: 'KES' };
    mock.onPost(`${BASE_URL}/wallet/send`).reply(500); // No message in response

    await expect(eazepay.wallet.sendMoney(sendMoneyPayload)).rejects.toThrow('Money transfer failed: Request failed with status code 500');
  });
});