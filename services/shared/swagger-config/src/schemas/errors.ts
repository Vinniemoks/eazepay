/**
 * Error response schemas
 */

export const errorSchemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      error: {
        type: 'string',
        example: 'Error message'
      },
      code: {
        type: 'string',
        example: 'ERROR_CODE'
      },
      details: {
        type: 'object',
        additionalProperties: true
      }
    }
  },

  ValidationErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      error: {
        type: 'string',
        example: 'Validation failed'
      },
      code: {
        type: 'string',
        example: 'VALIDATION_ERROR'
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              example: 'email'
            },
            message: {
              type: 'string',
              example: 'Invalid email format'
            }
          }
        }
      }
    }
  }
};
