// Error classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(404, `${resource} no encontrado`);
  }
}

// Error handler middleware
export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.statusCode },
      { status: error.statusCode }
    );
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  return Response.json(
    { error: 'Error interno del servidor' },
    { status: 500 }
  );
}

// Async route wrapper
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}