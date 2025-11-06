export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTH_ERROR',
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTHZ_ERROR',
    public statusCode: number = 403
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED', 401);
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor() {
    super('Invalid token', 'INVALID_TOKEN', 401);
    this.name = 'InvalidTokenError';
  }
}

export class MissingTokenError extends AuthenticationError {
  constructor() {
    super('No authentication token provided', 'MISSING_TOKEN', 401);
    this.name = 'MissingTokenError';
  }
}

export class InsufficientPermissionsError extends AuthorizationError {
  constructor(required: string | string[]) {
    const permissions = Array.isArray(required) ? required.join(', ') : required;
    super(`Insufficient permissions. Required: ${permissions}`, 'INSUFFICIENT_PERMISSIONS', 403);
    this.name = 'InsufficientPermissionsError';
  }
}

export class InvalidRoleError extends AuthorizationError {
  constructor(required: string | string[]) {
    const roles = Array.isArray(required) ? required.join(', ') : required;
    super(`Invalid role. Required: ${roles}`, 'INVALID_ROLE', 403);
    this.name = 'InvalidRoleError';
  }
}
