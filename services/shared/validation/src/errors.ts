export class ValidationError extends Error {
  public readonly statusCode: number = 422;
  public readonly code: string = 'VALIDATION_ERROR';
  public readonly errors: Array<{
    field: string;
    message: string;
    type?: string;
    value?: any;
  }>;

  constructor(errors: Array<{ field: string; message: string; type?: string; value?: any }>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
