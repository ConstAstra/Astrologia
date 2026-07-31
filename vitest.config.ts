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
      DATABASE_URL: `file:${path.resolve(__dirname, "prisma/test.db")}`,
      AUTH_SECRET: "test-secret-not-for-production",
    },
  },
});
