import validator from 'validator';

// Input validation rules
export const VALIDATION_RULES = {
  // Device ID validation - alphanumeric with hyphens and underscores
  DEVICE_ID: /^[a-zA-Z0-9_-]{1,64}$/,
  
  // Agent ID validation - alphanumeric with specific format
  AGENT_ID: /^[A-Z]{2,4}[0-9]{6,12}$/,
  
  // Status validation - specific allowed values
  DEVICE_STATUS: /^(active|inactive|maintenance|error)$/,
  
  // Location validation - latitude and longitude ranges
  LATITUDE: /^-?([1-8]?[0-9]|[1-9]0)(\.[0-9]{1,6})?$/,
  LONGITUDE: /^-?((1?[0-7]?[0-9]|[1-9]?0)(\.[0-9]{1,6})?|180(\.0{1,6})?)$/,
  
  // Metric name validation - alphanumeric with underscores
  METRIC_NAME: /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/,
  
  // Time validation - Unix timestamp or ISO 8601
  TIMESTAMP: /^[0-9]{10,13}$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  
  // Numeric validation - integers and decimals
  NUMERIC: /^-?\d+(\.\d+)?$/,
  
  // UUID validation
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

// Maximum lengths for various fields
export const MAX_LENGTHS = {
  DEVICE_ID: 64,
  AGENT_ID: 16,
  METRIC_NAME: 64,
  METADATA_KEY: 128,
  METADATA_VALUE: 1024,
  QUERY_LIMIT: 1000,
  RADIUS_KM: 100,
};

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: any;
}

// Base validator class
export class InputValidator {
  private errors: string[] = [];
  private sanitized: Record<string, any> = {};
  
  constructor(private data: any) {
    this.sanitized = { ...data };
  }
  
  // Validate required field
  required(field: string, fieldName?: string): this {
    if (!this.data[field] || this.data[field] === '') {
      this.errors.push(`${fieldName || field} is required`);
    }
    return this;
  }
  
  // Validate string format
  string(field: string, fieldName?: string): this {
    if (this.data[field] && typeof this.data[field] !== 'string') {
      this.errors.push(`${fieldName || field} must be a string`);
    }
    return this;
  }
  
  // Validate number format
  number(field: string, fieldName?: string): this {
    if (this.data[field] && (typeof this.data[field] !== 'number' || isNaN(this.data[field]))) {
      this.errors.push(`${fieldName || field} must be a number`);
    }
    return this;
  }
  
  // Validate minimum length
  minLength(field: string, min: number, fieldName?: string): this {
    if (this.data[field] && this.data[field].length < min) {
      this.errors.push(`${fieldName || field} must be at least ${min} characters`);
    }
    return this;
  }
  
  // Validate maximum length
  maxLength(field: string, max: number, fieldName?: string): this {
    if (this.data[field] && this.data[field].length > max) {
      this.errors.push(`${fieldName || field} must be no more than ${max} characters`);
    }
    return this;
  }
  
  // Validate pattern
  pattern(field: string, regex: RegExp, fieldName?: string): this {
    if (this.data[field] && !regex.test(this.data[field])) {
      this.errors.push(`${fieldName || field} has invalid format`);
    }
    return this;
  }
  
  // Validate range for numbers
  range(field: string, min: number, max: number, fieldName?: string): this {
    if (this.data[field] && (this.data[field] < min || this.data[field] > max)) {
      this.errors.push(`${fieldName || field} must be between ${min} and ${max}`);
    }
    return this;
  }
  
  // Sanitize string input
  sanitizeString(field: string): this {
    if (this.data[field] && typeof this.data[field] === 'string') {
      // Remove control characters
      this.sanitized[field] = this.data[field].replace(/[\x00-\x1f\x7f]/g, '');
      
      // Trim whitespace
      this.sanitized[field] = this.sanitized[field].trim();
      
      // Escape HTML entities
      this.sanitized[field] = this.sanitized[field]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
    return this;
  }
  
  // Validate and sanitize
  validate(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      sanitized: this.sanitized,
    };
  }
}

// Device validation
export function validateDeviceInput(data: any): ValidationResult {
  const validator = new InputValidator(data);
  
  validator
    .required('deviceId', 'Device ID')
    .string('deviceId', 'Device ID')
    .pattern('deviceId', VALIDATION_RULES.DEVICE_ID, 'Device ID')
    .maxLength('deviceId', MAX_LENGTHS.DEVICE_ID, 'Device ID')
    .sanitizeString('deviceId');
  
  if (data.deviceType) {
    validator
      .string('deviceType', 'Device type')
      .maxLength('deviceType', 50, 'Device type')
      .sanitizeString('deviceType');
  }
  
  if (data.agentId) {
    validator
      .string('agentId', 'Agent ID')
      .pattern('agentId', VALIDATION_RULES.AGENT_ID, 'Agent ID')
      .maxLength('agentId', MAX_LENGTHS.AGENT_ID, 'Agent ID')
      .sanitizeString('agentId');
  }
  
  if (data.status) {
    validator
      .string('status', 'Status')
      .pattern('status', VALIDATION_RULES.DEVICE_STATUS, 'Status')
      .sanitizeString('status');
  }
  
  // Validate metadata if present
  if (data.metadata) {
    if (typeof data.metadata !== 'object' || Array.isArray(data.metadata)) {
      validator.validate().errors.push('Metadata must be an object');
    } else {
      // Validate metadata keys and values
      for (const [key, value] of Object.entries(data.metadata)) {
        if (typeof key !== 'string' || key.length > MAX_LENGTHS.METADATA_KEY) {
          validator.validate().errors.push('Metadata key is invalid');
        }
        if (typeof value !== 'string' || value.length > MAX_LENGTHS.METADATA_VALUE) {
          validator.validate().errors.push('Metadata value is invalid');
        }
      }
    }
  }
  
  return validator.validate();
}

// Location validation
export function validateLocationInput(data: any): ValidationResult {
  const validator = new InputValidator(data);
  
  if (data.latitude !== undefined) {
    validator
      .number('latitude', 'Latitude')
      .range('latitude', -90, 90, 'Latitude');
  }
  
  if (data.longitude !== undefined) {
    validator
      .number('longitude', 'Longitude')
      .range('longitude', -180, 180, 'Longitude');
  }
  
  if (data.radius !== undefined) {
    validator
      .number('radius', 'Radius')
      .range('radius', 0, MAX_LENGTHS.RADIUS_KM, 'Radius');
  }
  
  return validator.validate();
}

// Telemetry validation
export function validateTelemetryInput(data: any): ValidationResult {
  const validator = new InputValidator(data);
  
  if (data.metric) {
    validator
      .string('metric', 'Metric')
      .pattern('metric', VALIDATION_RULES.METRIC_NAME, 'Metric')
      .maxLength('metric', MAX_LENGTHS.METRIC_NAME, 'Metric')
      .sanitizeString('metric');
  }
  
  if (data.value !== undefined) {
    validator.number('value', 'Value');
  }
  
  if (data.timestamp) {
    validator
      .string('timestamp', 'Timestamp')
      .pattern('timestamp', VALIDATION_RULES.TIMESTAMP, 'Timestamp')
      .sanitizeString('timestamp');
  }
  
  return validator.validate();
}

// Query parameter validation
export function validateQueryParams(data: any): ValidationResult {
  const validator = new InputValidator(data);
  
  if (data.limit !== undefined) {
    validator
      .number('limit', 'Limit')
      .range('limit', 1, MAX_LENGTHS.QUERY_LIMIT, 'Limit');
  }
  
  if (data.startTime) {
    validator
      .string('startTime', 'Start time')
      .pattern('startTime', VALIDATION_RULES.TIMESTAMP, 'Start time')
      .sanitizeString('startTime');
  }
  
  if (data.endTime) {
    validator
      .string('endTime', 'End time')
      .pattern('endTime', VALIDATION_RULES.TIMESTAMP, 'End time')
      .sanitizeString('endTime');
  }
  
  return validator.validate();
}

// SQL injection prevention
export function sanitizeForSQL(input: string): string {
  // Remove SQL keywords and special characters
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'UNION', 'OR', 'AND', 'WHERE', 'LIKE', 'IN', 'BETWEEN',
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS',
    'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'FETCH',
  ];
  
  let sanitized = input.toUpperCase();
  
  // Remove SQL keywords
  sqlKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Remove special SQL characters
  sanitized = sanitized.replace(/[;\'"`\\]/g, '');
  
  // Remove comments
  sanitized = sanitized.replace(/--.*$/gm, '');
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
  
  return sanitized.trim();
}

// NoSQL injection prevention
export function sanitizeForNoSQL(input: any): any {
  if (typeof input === 'string') {
    // Remove NoSQL operators
    const nosqlOperators = ['$where', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin', '$or', '$and'];
    
    let sanitized = input;
    nosqlOperators.forEach(op => {
      sanitized = sanitized.replace(new RegExp(`\\${op}`, 'g'), '');
    });
    
    return sanitized;
  } else if (typeof input === 'object' && input !== null) {
    // Recursively sanitize objects
    const sanitized: any = Array.isArray(input) ? [] : {};
    
    for (const [key, value] of Object.entries(input)) {
      // Remove keys that start with $ (NoSQL operators)
      if (!key.startsWith('$')) {
        sanitized[key] = sanitizeForNoSQL(value);
      }
    }
    
    return sanitized;
  }
  
  return input;
}

// Command injection prevention
export function sanitizeForCommand(input: string): string {
  // Remove command separators and special characters
  const dangerousChars = ['&', '|', ';', '$', '`', '>', '<', '(', ')', '{', '}', '[', ']'];
  
  let sanitized = input;
  dangerousChars.forEach(char => {
    sanitized = sanitized.replace(new RegExp(`\\${char}`, 'g'), '');
  });
  
  // Remove whitespace that could be used for command injection
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

// Path traversal prevention
export function sanitizePath(input: string): string {
  // Remove path traversal sequences
  let sanitized = input;
  
  // Remove ../ and ..\\ sequences
  sanitized = sanitized.replace(/\.\.[/\\]/g, '');
  
  // Remove absolute paths
  sanitized = sanitized.replace(/^[\/\\]/, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\x00/g, '');
  
  // Normalize path separators
  sanitized = sanitized.replace(/[/\\]+/g, '/');
  
  // Remove any remaining dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');
  
  return sanitized;
}

// Comprehensive input sanitization
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Apply all sanitization rules
    let sanitized = input;
    
    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Escape HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    return sanitized;
  } else if (typeof input === 'number') {
    // Validate number ranges
    if (isNaN(input) || !isFinite(input)) {
      return 0;
    }
    return input;
  } else if (typeof input === 'boolean') {
    return input;
  } else if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  } else if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      const sanitizedKey = sanitizeInput(key);
      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}