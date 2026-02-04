export type ErrorType = 
  | 'network'
  | 'validation'
  | 'unauthorized'
  | 'notFound'
  | 'serverError'
  | 'insufficientFunds'
  | 'unknown';

export class AppError extends Error {
  constructor(
    public readonly type: ErrorType,
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }

  static network(message = 'Network error. Please check your connection.'): AppError {
    return new AppError('network', message);
  }

  static validation(message: string): AppError {
    return new AppError('validation', message, 400);
  }

  static unauthorized(message = 'Session expired. Please login again.'): AppError {
    return new AppError('unauthorized', message, 401);
  }

  static notFound(message = 'Resource not found.'): AppError {
    return new AppError('notFound', message, 404);
  }

  static serverError(message = 'Server error. Please try again later.'): AppError {
    return new AppError('serverError', message, 500);
  }

  static insufficientFunds(message = 'Insufficient balance for this transaction.'): AppError {
    return new AppError('insufficientFunds', message, 400);
  }

  static fromStatusCode(statusCode: number, message?: string): AppError {
    switch (statusCode) {
      case 400:
        return AppError.validation(message || 'Invalid request.');
      case 401:
        return AppError.unauthorized(message);
      case 404:
        return AppError.notFound(message);
      default:
        if (statusCode >= 500) {
          return AppError.serverError(message);
        }
        return new AppError('unknown', message || 'An unexpected error occurred.', statusCode);
    }
  }
}
