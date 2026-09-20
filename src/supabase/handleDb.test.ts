import { Database } from "@/supabase/database.types";
import {
  getFabricVersion,
  getSketchJson,
  insertSketch,
} from "@/supabase/handleDb";
import pkg from "@/../package.json";
import { createClient } from "@supabase/supabase-js";
import createClientComponentClient from "@/supabase/supabaseClient";
import consola from "consola";

// Need the "launched local DB" when you run this tests.

vi.mock("@/supabase/supabaseClient", () => ({
  default: vi.fn(),
}));

describe("getSketchJsons,insertSketch", () => {
  test("getFabricVersion should return the fabric.js version", () => {
    const fabricVersion = pkg.dependencies.fabric;
    expect(getFabricVersion()).toEqual(fabricVersion);
  });

  it("should be able to save a Json", async () => {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_LOCAL_ADMIN_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    vi.mocked(createClientComponentClient).mockReturnValue(adminClient);

    const { data, error } = await adminClient.auth.admin.createUser({
      email: `${Date.now()}xxxx@test.com`,
      password: "xxxxxxxxx",
      email_confirm: true,
    });

    if (error) {
      consola.error(error);
    }

    const sketchExample: Database["public"]["Tables"]["sketches"]["Insert"] = {
      canvas_json: "test",
      title: "sketchExample",
      fabric_version: getFabricVersion(),
      user_id: data.user?.id,
    };

    const insertResult = await insertSketch(sketchExample);

    if (!insertResult.ok) {
      throw new Error(insertResult.error?.message);
    }

    expect(insertResult.ok).toBe(true);

    expect(insertResult.value.canvas_json).toEqual(sketchExample.canvas_json);

    if (!insertResult.value.id) {
      throw new Error(`Unexpected: id is undefined.`);
    }

    const getResult = await getSketchJson(insertResult.value.id);

    if (!getResult.ok) {
      throw new Error(getResult.error?.message);
    }

    expect(getResult.value).toEqual(sketchExample.canvas_json);

    if (data.user) adminClient.auth.admin.deleteUser(data.user?.id);
  });
});

afterEach(() => {
  vi.resetAllMocks();
});
