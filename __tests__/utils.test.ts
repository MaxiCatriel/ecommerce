import { createUrl, ensureStartsWith } from '../lib/utils';

describe('utils', () => {
  describe('createUrl', () => {
    it('creates URL without query params', () => {
      const params = new URLSearchParams();
      expect(createUrl('/test', params)).toBe('/test');
    });

    it('creates URL with query params', () => {
      const params = new URLSearchParams('foo=bar&baz=qux');
      expect(createUrl('/test', params)).toBe('/test?foo=bar&baz=qux');
    });
  });

  describe('ensureStartsWith', () => {
    it('returns string unchanged if it already starts with prefix', () => {
      expect(ensureStartsWith('https://example.com', 'https://')).toBe('https://example.com');
    });

    it('adds prefix if string does not start with it', () => {
      expect(ensureStartsWith('example.com', 'https://')).toBe('https://example.com');
    });
  });
});