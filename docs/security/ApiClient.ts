import { ApiClientConfig } from '../ApiClient';
import axios, { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create a mock adapter instance for axios
const mock = new MockAdapter(axios);

// Re-export the mock adapter so tests can access it
export { mock };

/**
 * Mocked ApiClient that uses axios-mock-adapter to intercept requests.
 */
export class ApiClient {
  constructor(config: ApiClientConfig) {
    // In a real scenario, you might want to assert config values here
  }

  public request<T>(config: AxiosRequestConfig): Promise<T> {
    return axios.request<T>(config).then(res => res.data);
  }
}