import { loginSchema, messageSchema, userSchema } from '../lib/validation';

describe('validation', () => {
  describe('messageSchema', () => {
    it('validates valid message', () => {
      const validMessage = {
        content: 'Hello, this is a test message',
        role: 'user' as const,
      };

      expect(() => messageSchema.parse(validMessage)).not.toThrow();
    });

    it('rejects message with empty content', () => {
      const invalidMessage = {
        content: '',
        role: 'user' as const,
      };

      expect(() => messageSchema.parse(invalidMessage)).toThrow();
    });

    it('rejects message with invalid role', () => {
      const invalidMessage = {
        content: 'Hello',
        role: 'invalid' as any,
      };

      expect(() => messageSchema.parse(invalidMessage)).toThrow();
    });
  });

  describe('userSchema', () => {
    it('validates valid user data', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      expect(() => userSchema.parse(validUser)).not.toThrow();
    });

    it('rejects user with invalid email', () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      expect(() => userSchema.parse(invalidUser)).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('validates valid login data', () => {
      const validLogin = {
        email: 'john@example.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(validLogin)).not.toThrow();
    });

    it('rejects login with missing password', () => {
      const invalidLogin = {
        email: 'john@example.com',
      };

      expect(() => loginSchema.parse(invalidLogin)).toThrow();
    });
  });
});