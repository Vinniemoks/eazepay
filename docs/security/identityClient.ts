import { ServiceClient, ServiceRegistry } from '@eazepay/service-client';
import logger from '@eazepay/logger';

const registry = ServiceRegistry.getInstance();

const identityClient = new ServiceClient({
  serviceName: 'financial-service',
  baseURL: registry.getUrl('identity-service'),
  circuitBreaker: { enabled: true },
  retry: { enabled: true, retries: 3 },
});

/**
 * Fetches user data from the Identity Service.
 * @param userId The ID of the user to fetch.
 * @returns A promise that resolves with the user data.
 */
export async function getUser(userId: string): Promise<any> {
  try {
    const response = await identityClient.get(`/api/users/${userId}`);
    logger.info(`Successfully fetched user data from identity-service for user: ${userId}`);
    return response.data;
  } catch (error: any) {
    logger.error(`Failed to fetch user data from identity-service for user: ${userId}`, {
      error: error.message,
      stack: error.stack,
    });
    throw error; // Re-throw the error to be handled by the calling function
  }
}