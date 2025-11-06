/**
 * Common reusable schemas for Swagger documentation
 */

export const commonSchemas = {
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'user@example.com'
      },
      phoneNumber: {
        type: 'string',
        example: '+254712345678'
      },
      fullName: {
        type: 'string',
        example: 'John Doe'
      },
      role: {
        type: 'string',
        enum: ['CUSTOMER', 'AGENT', 'ADMIN', 'MANAGER', 'SUPERUSER'],
        example: 'CUSTOMER'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-11-06T10:30:00Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-11-06T10:30:00Z'
      }
    }
  },

  Transaction: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      type: {
        type: 'string',
        enum: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT'],
        example: 'TRANSFER'
      },
      amount: {
        type: 'number',
        format: 'decimal',
        example: 1000.50
      },
      currency: {
        type: 'string',
        example: 'KES'
      },
      status: {
        type: 'string',
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
        example: 'COMPLETED'
      },
      fromUserId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      toUserId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      description: {
        type: 'string',
        example: 'Payment for services'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-11-06T10:30:00Z'
      }
    }
  },

  Wallet: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      userId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      balance: {
        type: 'number',
        format: 'decimal',
        example: 5000.00
      },
      currency: {
        type: 'string',
        example: 'KES'
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'FROZEN', 'CLOSED'],
        example: 'ACTIVE'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-11-06T10:30:00Z'
      }
    }
  },

  HealthCheck: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        example: 'healthy'
      },
      service: {
        type: 'string',
        example: 'financial-service'
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2025-11-06T10:30:00Z'
      },
      uptime: {
        type: 'number',
        example: 3600
      },
      version: {
        type: 'string',
        example: '1.0.0'
      }
    }
  }
};
