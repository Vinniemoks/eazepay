import { Eazepay } from '../Eazepay';
import { mock } from '../__mocks__/ApiClient';
import { CustomerLookupPayload, CustomerLookupResponse, AgentCashTransactionPayload, AgentCashTransactionResponse } from '../types/agent';

// Mock the ApiClient module
jest.mock('../ApiClient');

describe('Agent Service', () => {
  let eazepay: Eazepay;
  const API_KEY = 'test_api_key';
  const BASE_URL = 'http://localhost:8000/api';

  beforeEach(() => {
    eazepay = new Eazepay({ apiKey: API_KEY, baseUrl: BASE_URL });
    mock.reset(); // Reset mock adapter before each test
  });

  // --- Customer Lookup Tests ---
  it('should successfully lookup a customer', async () => {
    const lookupPayload: CustomerLookupPayload = {
      identifier: '+1234567890',
      identifierType: 'phone',
    };
    const lookupResponse: CustomerLookupResponse = {
      customerId: 'cust_123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      accountBalance: 2500.00,
      accountStatus: 'active',
    };

    mock.onPost(`${BASE_URL}/agents/customers/lookup`).reply(200, lookupResponse);

    const result = await eazepay.agent.lookupCustomer(lookupPayload);
    expect(result).toEqual(lookupResponse);
  });

  it('should throw an error if customer lookup fails', async () => {
    const lookupPayload: CustomerLookupPayload = {
      identifier: 'nonexistent',
      identifierType: 'account',
    };

    mock.onPost(`${BASE_URL}/agents/customers/lookup`).reply(404, { message: 'Customer not found' });

    await expect(eazepay.agent.lookupCustomer(lookupPayload)).rejects.toThrow('Customer lookup failed: Customer not found');
  });

  // --- Create Cash Transaction Tests ---
  it('should successfully create a cash deposit transaction', async () => {
    const cashTxPayload: AgentCashTransactionPayload = {
      customerId: 'cust_123',
      amount: 500,
      currency: 'KES',
      transactionType: 'deposit',
    };
    const cashTxResponse: AgentCashTransactionResponse = {
      transactionId: 'agent_txn_1',
      status: 'completed',
      message: 'Deposit successful',
      newBalance: 3000.00,
      currency: 'KES',
    };

    mock.onPost(`${BASE_URL}/agents/transactions/cash`).reply(200, cashTxResponse);

    const result = await eazepay.agent.createCashTransaction(cashTxPayload);
    expect(result).toEqual(cashTxResponse);
  });

  it('should throw an error if cash withdrawal fails due to insufficient float', async () => {
    const cashTxPayload: AgentCashTransactionPayload = {
      customerId: 'cust_123',
      amount: 50000,
      currency: 'KES',
      transactionType: 'withdrawal',
    };

    mock.onPost(`${BASE_URL}/agents/transactions/cash`).reply(400, { message: 'Insufficient agent float' });

    await expect(eazepay.agent.createCashTransaction(cashTxPayload)).rejects.toThrow('Cash transaction failed: Insufficient agent float');
  });

  it('should throw a generic error if cash transaction fails with an unknown error', async () => {
    const cashTxPayload: AgentCashTransactionPayload = { customerId: 'cust_123', amount: 100, currency: 'KES', transactionType: 'deposit' };
    mock.onPost(`${BASE_URL}/agents/transactions/cash`).reply(500); // No message in response

    await expect(eazepay.agent.createCashTransaction(cashTxPayload)).rejects.toThrow('Cash transaction failed: Request failed with status code 500');
  });
});