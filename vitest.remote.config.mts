import { configDefaults, defineConfig } from "vitest/config";
import baseConfig from "./vitest.config.mjs";

// Run only the tests against the remote project. Use `pnpm test:remote`.
// Not `mergeConfig`, because it concatenates arrays and the base `exclude` would remain.
export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ["**/*.remote.test.ts"],
    exclude: configDefaults.exclude,
  },
});
