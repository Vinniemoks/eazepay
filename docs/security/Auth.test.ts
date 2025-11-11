import { Eazepay } from '../Eazepay';
import { mock } from '../__mocks__/ApiClient';
import { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from '../types/auth';

// Mock the ApiClient module
jest.mock('../ApiClient');

describe('Auth Service', () => {
  let eazepay: Eazepay;
  const API_KEY = 'test_api_key';
  const BASE_URL = 'http://localhost:8000/api';

  beforeEach(() => {
    eazepay = new Eazepay({ apiKey: API_KEY, baseUrl: BASE_URL });
    mock.reset(); // Reset mock adapter before each test
  });

  // --- Register Tests ---
  it('should successfully register a new user', async () => {
    const registerPayload: RegisterPayload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '+1234567890',
    };
    const registerResponse: RegisterResponse = {
      userId: 'user_123',
      message: 'User registered successfully',
    };

    mock.onPost(`${BASE_URL}/auth/register`).reply(200, registerResponse);

    const result = await eazepay.auth.register(registerPayload);
    expect(result).toEqual(registerResponse);
  });

  it('should throw an error if registration fails', async () => {
    const registerPayload: RegisterPayload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '+1234567890',
    };

    mock.onPost(`${BASE_URL}/auth/register`).reply(400, { message: 'Email already exists' });

    await expect(eazepay.auth.register(registerPayload)).rejects.toThrow('Registration failed: Request failed with status code 400');
  });

  // --- Login Tests ---
  it('should successfully log in a user', async () => {
    const loginPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };
    const loginResponse: LoginResponse = {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      expiresIn: 3600,
      user: {
        id: 'user_123',
        email: 'test@example.com',
        username: 'testuser',
      },
    };

    mock.onPost(`${BASE_URL}/auth/login`).reply(200, loginResponse);

    const result = await eazepay.auth.login(loginPayload);
    expect(result).toEqual(loginResponse);
  });

  it('should throw an error if login fails', async () => {
    const loginPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    mock.onPost(`${BASE_URL}/auth/login`).reply(401, { message: 'Invalid credentials' });

    await expect(eazepay.auth.login(loginPayload)).rejects.toThrow('Login failed: Request failed with status code 401');
  });
});