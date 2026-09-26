import '@testing-library/jest-dom/vitest';
import { act, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Session code fails closed without a strong JWT_SECRET (audit N-04): any
// test that (transitively) exercises the real lib/auth/session module needs
// one. Provide a deterministic strong secret unless the runner sets its own.
process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  'vitest-session-secret-0123456789abcdef0123456789abcdef0123456789abcdef';

// RTL auto-cleanup registers itself on a GLOBAL afterEach when one exists
// (see the guard in @testing-library/react/dist/index.js); vitest.config.ts
// does not enable `globals`, so it never runs. Only some test files noticed
// and called cleanup() themselves — every other rendered tree stayed mounted
// until the jsdom environment was torn down at the end of its file, where
// React's scheduler could still fire pending callbacks against the destroyed
// environment. That surfaced as a flaky unhandled "window is not defined"
// and exit code 1 (UserProfileHeader.test.tsx, seen across the G6/G12/G13
// audit rounds). Register cleanup centrally instead:
afterEach(async () => {
  // Node-environment suites (// @vitest-environment node) have no DOM.
  if (typeof document === 'undefined') return;
  // Drain any scheduler work the test queued (passive effects, unmount
  // continuations) BEFORE unmounting, so nothing is left scheduled for a
  // moment when the environment no longer exists. RTL's act wrapper manages
  // IS_REACT_ACT_ENVIRONMENT around the callback, so this does not warn.
  await act(async () => {});
  cleanup();
});
