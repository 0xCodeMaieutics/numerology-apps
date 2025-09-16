/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/__test__/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    setupFiles: ["dotenv/config"],
  },
});
