/**
 * Authentication-related schemas
 */

export const authSchemas = {
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'user@example.com'
      },
      password: {
        type: 'string',
        format: 'password',
        example: 'SecurePassword123!'
      }
    }
  },

  LoginResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      refreshToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      expiresIn: {
        type: 'string',
        example: '8h'
      },
      user: {
        $ref: '#/components/schemas/User'
      }
    }
  },

  RegisterRequest: {
    type: 'object',
    required: ['email', 'password', 'phoneNumber', 'fullName'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'user@example.com'
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        example: 'SecurePassword123!'
      },
      phoneNumber: {
        type: 'string',
        pattern: '^\\+?[1-9]\\d{1,14}$',
        example: '+254712345678'
      },
      fullName: {
        type: 'string',
        minLength: 2,
        maxLength: 255,
        example: 'John Doe'
      },
      role: {
        type: 'string',
        enum: ['CUSTOMER', 'AGENT'],
        example: 'CUSTOMER'
      }
    }
  },

  RefreshTokenRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  },

  TokenPayload: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'user@example.com'
      },
      role: {
        type: 'string',
        enum: ['CUSTOMER', 'AGENT', 'ADMIN', 'MANAGER', 'SUPERUSER'],
        example: 'CUSTOMER'
      },
      sessionId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      permissions: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['READ_USERS', 'WRITE_TRANSACTIONS']
      }
    }
  }
};
