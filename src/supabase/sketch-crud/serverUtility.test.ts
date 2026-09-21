import { getFabricVersion } from "@/supabase/sketch-crud/serverUtility";
import pkg from "@/../package.json";

test("getFabricVersion should return the fabric.js version", () => {
  const fabricVersion = pkg.dependencies.fabric;
  expect(getFabricVersion()).toEqual(fabricVersion);
});
