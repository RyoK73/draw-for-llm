import { Database } from "@/supabase/database.types";
import {
  getFabricVersion,
  getSketchJson,
  insertSketch,
} from "@/supabase/sketch-crud/handleDb";
import pkg from "@/../package.json";
import { createClient } from "@supabase/supabase-js";
import createClientComponentClient from "@/supabase/supabaseClient";
import consola from "consola";

// Need the "launched local DB" when you run this tests.

vi.mock("@/supabase/supabaseClient", () => ({
  default: vi.fn(),
}));

test("getFabricVersion should return the fabric.js version", () => {
  const fabricVersion = pkg.dependencies.fabric;
  expect(getFabricVersion()).toEqual(fabricVersion);
});

describe("Fetch with admin Key", () => {
  let adminClient: ReturnType<typeof createClient>;
  let userId: string | undefined;
  let sketchExample: Database["public"]["Tables"]["sketches"]["Insert"];

  beforeEach(async () => {
    // If process.env.* is missing,this test fails
    adminClient = createClient(
      process.env.SUPABASE_LOCAL_URL!,
      process.env.SUPABASE_LOCAL_ADMIN_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          storageKey: `test-client${Date.now()}`,
        },
      },
    );

    const { data, error } = await adminClient.auth.admin.createUser({
      email: `${Date.now()}xxxx@test.com`,
      password: "xxxxxxxxx",
      email_confirm: true,
    });
    if (error) {
      consola.error(error);
    }
    userId = data.user?.id;

    sketchExample = {
      canvas_json: "test",
      title: "sketchExample",
      fabric_version: getFabricVersion(),
      user_id: userId,
    };
  });

  describe("Is RLS working?", () => {
    let anonClient: ReturnType<typeof createClient>;
    let anonUserId: string | undefined;
    beforeEach(async () => {
      // If process.env.* is missing,this test fails
      anonClient = createClient(
        process.env.SUPABASE_LOCAL_URL!,
        process.env.SUPABASE_LOCAL_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            storageKey: `test-client${Date.now()}`,
          },
        },
      );
    });

    test("insertSketch should return an error when a client fetches by ANON_KEY", async () => {
      vi.mocked(createClientComponentClient).mockReturnValue(anonClient);

      const insertResult = await insertSketch(sketchExample);

      expect(insertResult.ok).toBe(false);
    });
    test("getSketchJson should return an error when a client fetches by ANON_KEY", async () => {
      vi.mocked(createClientComponentClient).mockReturnValueOnce(adminClient);

      const insertResult = await insertSketch(sketchExample);

      if (!insertResult.ok) {
        throw new Error(insertResult.error?.message);
      }

      expect(insertResult.ok).toBe(true);

      expect(insertResult.value.canvas_json).toEqual(sketchExample.canvas_json);

      if (!insertResult.value.id) {
        throw new Error(`Unexpected: id is undefined.`);
      }

      vi.mocked(createClientComponentClient).mockReturnValueOnce(anonClient);

      const getResult = await getSketchJson(insertResult.value.id);

      expect(getResult.ok).toBe(false);
    });

    afterEach(() => {
      if (anonUserId) anonClient.auth.admin.deleteUser(anonUserId);
    });
  });

  describe("getSketchJsons and insertSketch", () => {
    it("should be able to Insert a Json properly", async () => {
      vi.mocked(createClientComponentClient).mockReturnValue(adminClient);

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
    });

    describe("getSketchJson", () => {
      it("should throw an error when the id is wrong", async () => {
        vi.mocked(createClientComponentClient).mockReturnValue(adminClient);

        const insertResult = await insertSketch(sketchExample);

        if (!insertResult.ok) {
          throw new Error(insertResult.error?.message);
        }

        expect(insertResult.ok).toBe(true);

        expect(insertResult.value.canvas_json).toEqual(
          sketchExample.canvas_json,
        );

        if (!insertResult.value.id) {
          throw new Error(`Unexpected: id is undefined.`);
        }

        const getResult = await getSketchJson("xxxxxxxxxxxxxxxx");

        expect(getResult.ok).toBe(false);
      });
    });

    afterEach(() => {
      if (userId) adminClient.auth.admin.deleteUser(userId);
    });
  });
});

afterEach(() => {
  vi.resetAllMocks();
});
