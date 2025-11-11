import { Eazepay } from '../Eazepay';
import { mock } from '../__mocks__/ApiClient';
import { CreateTransactionPayload, TransactionResponse, ListTransactionsQueryParams, TransactionListResponse } from '../types/transactions';

// Mock the ApiClient module
jest.mock('../ApiClient');

describe('Transactions Service', () => {
  let eazepay: Eazepay;
  const API_KEY = 'test_api_key';
  const BASE_URL = 'http://localhost:8000/api';

  beforeEach(() => {
    eazepay = new Eazepay({ apiKey: API_KEY, baseUrl: BASE_URL });
    mock.reset(); // Reset mock adapter before each test
  });

  // --- Create Transaction Tests ---
  it('should successfully create a new transaction', async () => {
    const createPayload: CreateTransactionPayload = {
      amount: 100,
      currency: 'KES',
      recipientId: 'user_rec123',
      description: 'Test payment',
    };
    const createResponse: TransactionResponse = {
      transactionId: 'txn_abc123',
      status: 'pending',
      amount: 100,
      currency: 'KES',
      senderId: 'user_sender456',
      recipientId: 'user_rec123',
      description: 'Test payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mock.onPost(`${BASE_URL}/transactions`).reply(200, createResponse);

    const result = await eazepay.transactions.create(createPayload);
    expect(result).toEqual(createResponse);
  });

  it('should throw an error if transaction creation fails', async () => {
    const createPayload: CreateTransactionPayload = {
      amount: 100,
      currency: 'KES',
      recipientId: 'user_rec123',
    };

    mock.onPost(`${BASE_URL}/transactions`).reply(400, { message: 'Insufficient funds' });

    await expect(eazepay.transactions.create(createPayload)).rejects.toThrow('Failed to create transaction: Request failed with status code 400');
  });

  // --- Get Transaction Tests ---
  it('should successfully retrieve a transaction by ID', async () => {
    const transactionId = 'txn_abc123';
    const getResponse: TransactionResponse = {
      transactionId: transactionId,
      status: 'completed',
      amount: 100,
      currency: 'KES',
      senderId: 'user_sender456',
      recipientId: 'user_rec123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mock.onGet(`${BASE_URL}/transactions/${transactionId}`).reply(200, getResponse);

    const result = await eazepay.transactions.get(transactionId);
    expect(result).toEqual(getResponse);
  });

  it('should throw an error if transaction is not found', async () => {
    const transactionId = 'txn_nonexistent';
    mock.onGet(`${BASE_URL}/transactions/${transactionId}`).reply(404, { message: 'Transaction not found' });

    await expect(eazepay.transactions.get(transactionId)).rejects.toThrow('Failed to retrieve transaction txn_nonexistent: Request failed with status code 404');
  });

  // --- List Transactions Tests ---
  it('should successfully list transactions', async () => {
    const listParams: ListTransactionsQueryParams = { userId: 'user_sender456', limit: 10 };
    const listResponse: TransactionListResponse = {
      transactions: [
        { transactionId: 'txn_1', status: 'completed', amount: 50, currency: 'KES', senderId: 'user_sender456', recipientId: 'user_a', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { transactionId: 'txn_2', status: 'pending', amount: 75, currency: 'KES', senderId: 'user_sender456', recipientId: 'user_b', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
      count: 2,
    };

    mock.onGet(`${BASE_URL}/transactions`, { params: listParams }).reply(200, listResponse);

    const result = await eazepay.transactions.list(listParams);
    expect(result).toEqual(listResponse);
  });

  it('should throw an error if listing transactions fails', async () => {
    const listParams: ListTransactionsQueryParams = { status: 'failed' };
    mock.onGet(`${BASE_URL}/transactions`, { params: listParams }).reply(500, { message: 'Internal server error' });

    await expect(eazepay.transactions.list(listParams)).rejects.toThrow('Failed to list transactions: Request failed with status code 500');
  });
});