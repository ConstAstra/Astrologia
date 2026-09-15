import { vi } from "vitest";

// `next/headers`'s cookies() only works inside a real Next.js request
// scope — it throws when a route handler is invoked directly in a test.
// This in-memory jar stands in for the browser's cookie store across a
// single test file, so a login call's session cookie is visible to a
// subsequent call in the same test (e.g. login then change-password).
const store = new Map<string, string>();

export const cookieJar = {
  get: (name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined),
  set: (name: string, value: string) => {
    store.set(name, value);
  },
  delete: (name: string) => {
    store.delete(name);
  },
  clear: () => store.clear(),
};

vi.mock("next/headers", () => ({
  cookies: async () => cookieJar,
}));
