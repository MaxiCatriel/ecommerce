# Testing

This project uses Jest and React Testing Library for unit testing.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

## Test Structure

Tests are located in the `__tests__` directory at the root level. Test files follow the naming convention `*.test.ts` or `*.test.tsx`.

## Test Configuration

The test configuration is defined in `jest.config.ts` and includes:

- TypeScript support with `ts-node`
- jsdom environment for DOM testing
- Module name mapping for path aliases (`@/*`)
- Setup file for global test configuration
- Coverage collection from app, components, and lib directories

## Test Setup

The `jest.setup.ts` file includes:

- `@testing-library/jest-dom` for extended matchers
- Next.js router mocking
- Environment variable mocking
- MSW (Mock Service Worker) for API mocking

## Writing Tests

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### Utility Function Testing

```typescript
import { myUtilityFunction } from '../lib/utils';

describe('myUtilityFunction', () => {
  it('returns expected result', () => {
    const result = myUtilityFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Validation Testing

```typescript
import { mySchema } from '../lib/validation';

describe('mySchema', () => {
  it('validates valid input', () => {
    const validInput = { /* valid data */ };
    expect(() => mySchema.parse(validInput)).not.toThrow();
  });

  it('rejects invalid input', () => {
    const invalidInput = { /* invalid data */ };
    expect(() => mySchema.parse(invalidInput)).toThrow();
  });
});
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

Current coverage focuses on critical business logic in utilities, validation, and core components.