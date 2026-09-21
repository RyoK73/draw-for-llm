import { Database } from "@/supabase/database.types";
import {
  getSketchJson,
  insertSketch,
  getSketchData,
} from "@/supabase/sketch-crud/handleDb";
import { getFabricVersion } from "@/supabase/sketch-crud/serverUtility";
import { createClient } from "@supabase/supabase-js";
import createBrowerClient from "@/supabase/supabaseClient";

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
    vi.mocked(createBrowerClient).mockReturnValue(anonClient);

    const insertResult = await insertSketch(sketchExample);

    expect(insertResult.ok).toBe(false);
  });

  test("getSketchJson should return an error when a client fetches by ANON_KEY", async () => {
    vi.mocked(createBrowerClient).mockReturnValueOnce(authenticatedClient);

    const insertResult = await insertSketch(sketchExample);

    if (!insertResult.ok) {
      throw new Error(insertResult.error?.message);
    }

    expect(insertResult.value.canvas_json).toEqual(sketchExample.canvas_json);

    if (!insertResult.value.id) {
      throw new Error(`Unexpected: id is undefined.`);
    }

    vi.mocked(createBrowerClient).mockReturnValueOnce(anonClient);

    const getResult = await getSketchJson(insertResult.value.id);

    expect(getResult.ok).toBe(false);
  });

  test("getSketchData should return an error when a client fetches by ANON_KEY", async () => {
    vi.mocked(createBrowerClient).mockReturnValueOnce(authenticatedClient);

    await insertSketch(sketchExample);

    vi.mocked(createBrowerClient).mockReturnValueOnce(anonClient);

    const getResult = await getSketchData();

    expect(getResult.ok).toBe(false);
  });
});

describe("insertSketch,getSketchJson , and getSketchData should work for an authenticated user", () => {
  beforeEach(() => {
    vi.mocked(createBrowerClient).mockReturnValue(authenticatedClient);
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
    await insertSketch(sketchExample);

    const getResult = await getSketchJson("xxxxxxxxxxxxxxxx");

    expect(getResult.ok).toBe(false);
  });

  test("getSketchData should return { id, title, description, created_at }[]", async () => {
    const sketches = [sketchExample, sketchExample];

    const insertResults = sketches.map(
      async (sketch) => await insertSketch(sketch),
    );

    await Promise.all(insertResults);

    const sketchData = await getSketchData();

    expect(sketchData.ok).toBe(true);
    if (sketchData.ok) {
      sketchData.value.map((data, index) => {
        const { canvas_json, fabric_version, user_id, ...newSketch } =
          sketches[index];
        expect(data).toMatchObject(newSketch);
      });
    }
  });
});
