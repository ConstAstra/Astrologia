import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["./vitest.global-setup.ts"],
    setupFiles: ["./src/test/setup.ts"],
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL || "postgresql://postgres:astrologium_dev@localhost:5432/astrologium_test",
      AUTH_SECRET: "test-secret-not-for-production",
    },
  },
});
