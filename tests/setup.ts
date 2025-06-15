import '@testing-library/jest-dom/vitest';

// ensure env vars are loaded before any database import
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Mock the sendEmail util so no real emails are sent during tests
import { vi } from 'vitest';
vi.mock('~/server/email', () => ({
  sendEmail: vi.fn(async (_opts) => {
    // Silently succeed. Optionally log for debugging:
    // console.log("[mock sendEmail]", _opts.subject)
    return Promise.resolve();
  }),
}));

// Note: Integration tests that require a database have been commented out
// Better-Auth already has comprehensive tests for its security features
