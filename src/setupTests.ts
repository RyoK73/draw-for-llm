import "@testing-library/jest-dom/vitest"; // Pre-import
import { loadEnvFile } from "node:process";
import path from "node:path";

loadEnvFile(path.join(process.cwd(), ".env.local"));
