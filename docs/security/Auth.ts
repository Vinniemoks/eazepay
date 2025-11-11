/**
 * Payload for the user registration endpoint.
 */
export interface RegisterPayload {
  username: string;
  email: string;
  password?: string; // Password might be optional if using social logins in the future
  phoneNumber: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

/**
 * Payload for the user login endpoint.
 */
export interface LoginPayload {
  email: string;
  password?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Expiration in seconds
  user: {
    id: string;
    email: string;
    username: string;
  };
}