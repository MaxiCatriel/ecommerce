type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  error?: Error;
  metadata?: Record<string, any>;
}

class Logger {
  private formatMessage(entry: LogEntry): string {
    const baseMessage = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;

    if (entry.userId) {
      return `${baseMessage} (User: ${entry.userId})`;
    }

    return baseMessage;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedMessage, metadata);
        }
        break;
      case 'info':
        console.info(formattedMessage, metadata);
        break;
      case 'warn':
        console.warn(formattedMessage, metadata);
        break;
      case 'error':
        console.error(formattedMessage, metadata);
        // In production, you might want to send this to a logging service
        break;
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    const errorMetadata = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };

    this.log('error', message, errorMetadata);
  }

  // Specialized logging methods
  apiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string) {
    this.info(`API ${method} ${path}`, {
      method,
      path,
      statusCode,
      duration,
      userId,
    });
  }

  authEvent(event: string, userId?: string, metadata?: Record<string, any>) {
    this.info(`Auth: ${event}`, {
      event,
      userId,
      ...metadata,
    });
  }

  paymentEvent(event: string, amount: number, currency: string, userId?: string) {
    this.info(`Payment: ${event}`, {
      event,
      amount,
      currency,
      userId,
    });
  }
}

export const logger = new Logger();