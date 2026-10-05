import {
  getSketchJson,
  insertSketch,
  upsertSketch,
  getSketchData,
} from "@/supabase/sketch-crud/handleDb";
import { getFabricVersion } from "@/supabase/sketch-crud/serverUtility";
import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";
import { TestUser } from "@/supabase/utils/supabaseTestUtility.types";
import type { InsertSketch } from "@/supabase/sketch-crud/handleDb.types";

const helper = supabaseTestHelper();
const { adminClient, createAnonClient, insertOwnFrameOrThrow } = helper;
const userTracker = helper.createTestUserTracker();

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
let firstUser: TestUser;
let sketchExample: InsertSketch;
let frame: Awaited<ReturnType<typeof insertOwnFrameOrThrow>>;

beforeEach(async () => {
  userTracker.reset();
  firstUser = await userTracker.create();
  sketchExample = createTestSketch(firstUser.userId);
  frame = await insertOwnFrameOrThrow(
    firstUser,
    `frame_${crypto.randomUUID()}`,
    {
      width: 1024,
      height: 768,
    },
  );
});

afterEach(async () => {
  vi.resetAllMocks();
  try {
    // Sketches and frames must be removed before deleting the users (foreign key).
    // service_role has no privilege on sketches, so each user deletes own sketches.
    for (const user of userTracker.users) {
      await user.client.from("sketches").delete().eq("user_id", user.userId);
    }
    await adminClient
      .from("canvas_frames")
      .delete()
      .in(
        "user_id",
        userTracker.users.map((user) => user.userId),
      );
  } finally {
    await userTracker.deleteAll();
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
      firstUser.client,
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
      firstUser.client,
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
    const secondUser = await userTracker.create();
    const secondUserSketch = createTestSketch(secondUser.userId);

    // First user's opperating
    vi.mocked(createSupabaseBrowserClient).mockReturnValueOnce(
      firstUser.client,
    );

    const firstUserInsertResult = await insertSketch(sketchExample);

    if (!firstUserInsertResult.ok) {
      throw new Error(firstUserInsertResult.error?.message);
    }

    // Second user's opperating
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(secondUser.client);

    // Test Phase
    const maliciousTitle = "Malicious Title";

    const maliciousSketchExample = {
      ...secondUserSketch,
      id: firstUserInsertResult.value.id,
      title: maliciousTitle,
    };

    const maliciousUpsertResult = await upsertSketch(maliciousSketchExample);

    expect(maliciousUpsertResult.ok).toBe(false); // RLS Error
  });
});

describe("insertSketch,getSketchJson , and getSketchData should work for an authenticated user", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(firstUser.client);
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
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(firstUser.client);
    const upsertResult = await upsertSketch(sketchExample);

    expect(upsertResult.ok).toBe(true);

    if (!upsertResult.ok) {
      throw new Error(upsertResult.error?.message);
    }

    expect(upsertResult.value.canvas_json).toEqual(sketchExample.canvas_json);
    expect(upsertResult.value.id).not.toBeNull();
  });

  it("should update sketch with the id that user owns", async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(firstUser.client);
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
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(firstUser.client);

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
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(firstUser.client);
    const firstFrame = frame;
    const secondFrame = await insertOwnFrameOrThrow(
      firstUser,
      `frame_${crypto.randomUUID()}`,
      {
        width: 640,
        height: 480,
      },
    );
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
