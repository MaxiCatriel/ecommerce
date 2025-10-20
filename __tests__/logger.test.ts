import { logger } from '../lib/logger';

describe('logger', () => {
  const originalConsole = global.console;

  beforeEach(() => {
    // Mock console methods
    global.console = {
      ...originalConsole,
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    };
  });

  afterEach(() => {
    global.console = originalConsole;
  });

  it('logs info messages', () => {
    logger.info('Test info message', { userId: 123 });
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('Test info message'),
      expect.objectContaining({ userId: 123 })
    );
  });

  it('logs error messages', () => {
    const error = new Error('Test error');
    logger.error('Test error message', error, { userId: 123 });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Test error message'),
      expect.objectContaining({
        error: expect.objectContaining({
          name: 'Error',
          message: 'Test error',
        }),
        userId: 123
      })
    );
  });

  it('logs warning messages', () => {
    logger.warn('Test warning message', { userId: 123 });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Test warning message'),
      expect.objectContaining({ userId: 123 })
    );
  });
});