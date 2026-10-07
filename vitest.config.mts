import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true, // To ommit (it,expect,describe) import lines and cleanup "Render" automatically.
    setupFiles: "./src/setupTests.ts",
    env: {
      DEBUG_PRINT_LIMIT: "100",
    },
    reporters: ["verbose"],
    exclude: [...configDefaults.exclude, "**/*.remote.test.ts"], // Run them by `pnpm test:remote`.
  },
  resolve: { tsconfigPaths: true }, // To resolve a path(@) line.
});
