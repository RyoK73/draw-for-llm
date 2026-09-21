import { Database } from "@/supabase/database.types";
import {
  getFabricVersion,
  getSketchJson,
  insertSketch,
  getSketchData,
} from "@/supabase/sketch-crud/handleDb";
import pkg from "@/../package.json";
import { createClient } from "@supabase/supabase-js";
import createClientComponentClient from "@/supabase/supabaseClient";

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

const createTestSketch = (
  userId: string | undefined,
): Database["public"]["Tables"]["sketches"]["Insert"] => ({
  canvas_json: "test",
  description: "this is test",
  title: "sketchExample",
  fabric_version: getFabricVersion(),
  user_id: userId,
});

// Launch the supabase DB before running this tests.

test("getFabricVersion should return the fabric.js version", () => {
  const fabricVersion = pkg.dependencies.fabric;
  expect(getFabricVersion()).toEqual(fabricVersion);
});

// Create a user by adminClient
const adminClient = createTestClient(process.env.SUPABASE_LOCAL_ADMIN_KEY!);
let authenticatedClient: ReturnType<typeof createTestClient>;
let createdUserId: string | undefined;
let sketchExample: Database["public"]["Tables"]["sketches"]["Insert"];

beforeEach(async () => {
  const email: string = `${Date.now()}xxxx@test.com`;
  const password: string = "xxxxxxxxx";

  const { data: _, error: createdUserError } =
    await adminClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

  if (createdUserError) {
    throw new Error(createdUserError.message);
  }

  // Create an authenticatedClient
  authenticatedClient = createTestClient(process.env.SUPABASE_LOCAL_ANON_KEY!);

  // Grant authenticated role to authenticatedClient
  const { data: signInData, error: signInError } =
    await authenticatedClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

  if (signInError) {
    throw new Error(signInError.message);
  }

  createdUserId = signInData.user.id;

  sketchExample = createTestSketch(createdUserId);
});

afterEach(async () => {
  vi.resetAllMocks();
  if (createdUserId) {
    await authenticatedClient
      .from("sketches")
      .delete()
      .eq("user_id", createdUserId);
    const { error } = await adminClient.auth.admin.deleteUser(createdUserId);
    if (error) console.log(error);
  }
});

vi.mock("@/supabase/supabaseClient", () => ({
  default: vi.fn(),
}));

describe("Is RLS working?", () => {
  const anonClient = createTestClient(process.env.SUPABASE_LOCAL_ANON_KEY!);

  test("insertSketch should return an error when a client fetches by ANON_KEY", async () => {
    vi.mocked(createClientComponentClient).mockReturnValue(anonClient);

    const insertResult = await insertSketch(sketchExample);

    expect(insertResult.ok).toBe(false);
  });

  test("getSketchJson should return an error when a client fetches by ANON_KEY", async () => {
    vi.mocked(createClientComponentClient).mockReturnValueOnce(
      authenticatedClient,
    );

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

describe("getSketchJsons or getSketchData and insertSketch", () => {
  beforeEach(() => {
    vi.mocked(createClientComponentClient).mockReturnValue(authenticatedClient);
  });
  it("should be able to Insert a Json and get a Json that inserted", async () => {
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
