import '@testing-library/jest-dom/vitest';

// Session code fails closed without a strong JWT_SECRET (audit N-04): any
// test that (transitively) exercises the real lib/auth/session module needs
// one. Provide a deterministic strong secret unless the runner sets its own.
process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  'vitest-session-secret-0123456789abcdef0123456789abcdef0123456789abcdef';
