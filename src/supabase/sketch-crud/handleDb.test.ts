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

// helper function
const createTestClient = (key: string): ReturnType<typeof createClient> => {
  return createClient(process.env.SUPABASE_LOCAL_URL!, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: `test-client${Date.now()}`,
    },
  });
};

// Launch the supabase DB before running this tests.

test("getFabricVersion should return the fabric.js version", () => {
  const fabricVersion = pkg.dependencies.fabric;
  expect(getFabricVersion()).toEqual(fabricVersion);
});

let adminClient: ReturnType<typeof createClient>;
let userId: string | undefined;
let sketchExample: Database["public"]["Tables"]["sketches"]["Insert"];

beforeEach(async () => {
  // If process.env.* is missing,this test fails
  adminClient = createTestClient(process.env.SUPABASE_LOCAL_ADMIN_KEY!);

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

vi.mock("@/supabase/supabaseClient", () => ({
  default: vi.fn(),
}));

describe("Is RLS working?", () => {
  let anonClient: ReturnType<typeof createClient>;
  beforeEach(async () => {
    // If process.env.* is missing,this test fails
    anonClient = createTestClient(process.env.SUPABASE_LOCAL_ANON_KEY!);
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
});

describe("getSketchJsons and insertSketch", () => {
  it("should be able to Insert a Json and get a Json that inserted", async () => {
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

  it("should throw an error when the id is wrong", async () => {
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

    const getResult = await getSketchJson("xxxxxxxxxxxxxxxx");

    expect(getResult.ok).toBe(false);
  });
});

afterEach(() => {
  vi.resetAllMocks();
  if (userId) adminClient.auth.admin.deleteUser(userId);
});
