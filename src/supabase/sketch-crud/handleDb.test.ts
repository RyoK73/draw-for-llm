import { Database } from "@/supabase/utils/database.types";
import {
  getSketchJson,
  insertSketch,
  upsertSketch,
  getSketchData,
} from "@/supabase/sketch-crud/handleDb";
import { getFabricVersion } from "@/supabase/sketch-crud/serverUtility";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";
import type { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";

const {
  createAnonClient,
  createTestUser,
  deleteTestUser,
  insertOwnFrameOrThrow,
} = supabaseTestHelper();

const createTestSketch = (userId: string | undefined): InsertSketch => ({
  canvas_json: "test",
  description: "this is test",
  title: "sketchExample",
  fabric_version: getFabricVersion(),
  user_id: userId,
  width: 800,
  height: 600,
});

// Launch the supabase DB before running this tests.
let authenticatedClient: ReturnType<typeof createClient<Database>>;
let createdUserId: string | undefined;
let sketchExample: InsertSketch;

const insertOwnFrame = (
  name: string,
  size: { width: number; height: number },
) => {
  if (!createdUserId)
    throw new Error("Unexpected: createdUserId is undefined.");

  return insertOwnFrameOrThrow(
    { client: authenticatedClient, userId: createdUserId },
    name,
    size,
  );
};

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

vi.mock("@/supabase/utils/browserClient", () => ({
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
  test("upsertSketch should return an error when a client fetches by ANON_KEY", async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(anonClient);

    const upsertSketch = await insertSketch(sketchExample);

    expect(upsertSketch.ok).toBe(false);
  });

  test("upsertSketch should throw an error when the user upserts with the other user's id", async () => {
    // Preparation Phase
    const secondUserResult = await createTestUser();

    if (!secondUserResult.ok) {
      throw new Error(secondUserResult.error.message);
    }

    const secondUserAuthenticatedClient =
      secondUserResult.value.authenticatedClient;

    const secondUserId = secondUserResult.value.createdUserId;
    const secondUserSketch = createTestSketch(secondUserId);

    // First user's opperating
    vi.mocked(createSupabaseBrowserClient).mockReturnValueOnce(
      authenticatedClient,
    );

    const firstUserInsertResult = await insertSketch(sketchExample);

    if (!firstUserInsertResult.ok) {
      throw new Error(firstUserInsertResult.error?.message);
    }

    // Second user's opperating
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(
      secondUserAuthenticatedClient,
    );

    // Test Phase
    const maliciousTitle = "Malicious Title";

    const maliciousSketchExample = {
      ...secondUserSketch,
      id: firstUserInsertResult.value.id,
      title: maliciousTitle,
    };

    const maliciousUpsertResult = await upsertSketch(maliciousSketchExample);

    expect(maliciousUpsertResult.ok).toBe(false); // RLS Error

    // Cleanup Phase
    if (secondUserId) {
      await secondUserAuthenticatedClient
        .from("sketches")
        .delete()
        .eq("user_id", secondUserId);
      const deleteResult = await deleteTestUser(secondUserId);
      if (!deleteResult.ok) throw new Error(deleteResult.error.message);
    }
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

  it("should save and return width, height, cell_size and frame_id when insertSketch is called with them", async () => {
    const frame = await insertOwnFrame(`frame_${crypto.randomUUID()}`, {
      width: 1024,
      height: 768,
    });
    const sketch: InsertSketch = {
      ...sketchExample,
      width: frame.width,
      height: frame.height,
      cell_size: 32,
      frame_id: frame.id,
    };

    const insertResult = await insertSketch(sketch);

    if (!insertResult.ok) {
      throw new Error(insertResult.error?.message);
    }

    expect(insertResult.value).toMatchObject({
      width: 1024,
      height: 768,
      cell_size: 32,
      frame_id: frame.id,
    });
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
        const {
          canvas_json,
          fabric_version,
          user_id,
          width,
          height,
          ...newSketch
        } = sketches[index];
        expect(data).toMatchObject(newSketch);
      });
    }
  });
});

describe("upsertSketch", () => {
  it("should insert sketch and return an id when user upserts without id", async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(authenticatedClient);
    const upsertResult = await upsertSketch(sketchExample);

    expect(upsertResult.ok).toBe(true);

    if (!upsertResult.ok) {
      throw new Error(upsertResult.error?.message);
    }

    expect(upsertResult.value.canvas_json).toEqual(sketchExample.canvas_json);
    expect(upsertResult.value.id).not.toBeNull();
  });

  it("should update sketch with the id that user owns", async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(authenticatedClient);
    const insertResult = await insertSketch(sketchExample);
    if (!insertResult.ok) {
      throw new Error(insertResult.error?.message);
    }

    const changedTitle = "This is my first sketch";
    const updatedSketchExample = {
      ...sketchExample,
      id: insertResult.value.id,
      title: changedTitle,
    };

    const upsertResult = await upsertSketch(updatedSketchExample);

    expect(upsertResult.ok).toBe(true);

    if (!upsertResult.ok) {
      throw new Error(upsertResult.error?.message);
    }

    expect(upsertResult.value.id).toEqual(insertResult.value.id);
    expect(upsertResult.value.title).toEqual(changedTitle);
    expect(upsertResult.value.updated_at).not.toEqual(
      insertResult.value.updated_at,
    );
  });

  it("should save and return width, height, cell_size and frame_id when upsertSketch inserts with them", async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(authenticatedClient);
    const frame = await insertOwnFrame(`frame_${crypto.randomUUID()}`, {
      width: 1024,
      height: 768,
    });

    const upsertResult = await upsertSketch({
      ...sketchExample,
      width: frame.width,
      height: frame.height,
      cell_size: 32,
      frame_id: frame.id,
    });

    if (!upsertResult.ok) {
      throw new Error(upsertResult.error?.message);
    }

    expect(upsertResult.value).toMatchObject({
      width: 1024,
      height: 768,
      cell_size: 32,
      frame_id: frame.id,
    });
  });

  it("should update width, height, cell_size and frame_id when upsertSketch updates with them", async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(authenticatedClient);
    const firstFrame = await insertOwnFrame(`frame_${crypto.randomUUID()}`, {
      width: 1024,
      height: 768,
    });
    const secondFrame = await insertOwnFrame(`frame_${crypto.randomUUID()}`, {
      width: 640,
      height: 480,
    });
    const insertResult = await insertSketch({
      ...sketchExample,
      width: firstFrame.width,
      height: firstFrame.height,
      cell_size: 32,
      frame_id: firstFrame.id,
    });
    if (!insertResult.ok) {
      throw new Error(insertResult.error?.message);
    }

    const upsertResult = await upsertSketch({
      ...sketchExample,
      id: insertResult.value.id,
      width: secondFrame.width,
      height: secondFrame.height,
      cell_size: 16,
      frame_id: secondFrame.id,
    });

    if (!upsertResult.ok) {
      throw new Error(upsertResult.error?.message);
    }

    expect(upsertResult.value).toMatchObject({
      id: insertResult.value.id,
      width: 640,
      height: 480,
      cell_size: 16,
      frame_id: secondFrame.id,
    });
  });
});
