import { Database } from "@/supabase/database.types";
import {
  getSketchJson,
  insertSketch,
  getSketchData,
} from "@/supabase/sketch-crud/handleDb";
import { getFabricVersion } from "@/supabase/sketch-crud/serverUtility";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/supabase/browserClient";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";

const { createAnonClient, createTestUser, deleteTestUser } =
  supabaseTestHelper();

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
let authenticatedClient: ReturnType<typeof createClient>;
let createdUserId: string | undefined;
let sketchExample: Database["public"]["Tables"]["sketches"]["Insert"];

beforeEach(async () => {
  const createdUserResult = await createTestUser();

  if (!createdUserResult.ok) {
    throw new Error(createdUserResult.error.message);
  }

  authenticatedClient = createdUserResult.value.authenticatedClient;
  createdUserId = createdUserResult.value.createdUserId;

  sketchExample = createTestSketch(createdUserId);
});

afterEach(async () => {
  vi.resetAllMocks();
  if (createdUserId) {
    await authenticatedClient
      .from("sketches")
      .delete()
      .eq("user_id", createdUserId);
    const deleteResult = await deleteTestUser(createdUserId);
    if (!deleteResult.ok) console.log(deleteResult.error);
  }
});

vi.mock("@/supabase/browserClient", () => ({
  createSupabaseBrowserClient: vi.fn(),
}));

describe("Is RLS working?", () => {
  const anonClient = createAnonClient();

  test("insertSketch should return an error when a client fetches by ANON_KEY", async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(anonClient);

    const insertResult = await insertSketch(sketchExample);

    expect(insertResult.ok).toBe(false);
  });

  test("getSketchJson should return an error when a client fetches by ANON_KEY", async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValueOnce(
      authenticatedClient,
    );

    const insertResult = await insertSketch(sketchExample);

    if (!insertResult.ok) {
      throw new Error(insertResult.error?.message);
    }

    expect(insertResult.value.canvas_json).toEqual(sketchExample.canvas_json);

    if (!insertResult.value.id) {
      throw new Error(`Unexpected: id is undefined.`);
    }

    vi.mocked(createSupabaseBrowserClient).mockReturnValueOnce(anonClient);

    const getResult = await getSketchJson(insertResult.value.id);

    expect(getResult.ok).toBe(false);
  });

  test("getSketchData should return an error when a client fetches by ANON_KEY", async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValueOnce(
      authenticatedClient,
    );

    await insertSketch(sketchExample);

    vi.mocked(createSupabaseBrowserClient).mockReturnValueOnce(anonClient);

    const getResult = await getSketchData();

    expect(getResult.ok).toBe(false);
  });
});

describe("insertSketch,getSketchJson , and getSketchData should work for an authenticated user", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(authenticatedClient);
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
