import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/utils/database.types";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";

const helper = supabaseTestHelper();
const { createTestUser, deleteTestUser } = helper;

// The helper returns untyped clients, so they are typed here to use the table types.
type TestClient = SupabaseClient<Database>;

const adminClient = helper.adminClient;

type TestUser = { client: TestClient; userId: string };

const PG_NOT_NULL_VIOLATION = "23502";
const PG_CHECK_VIOLATION = "23514";

const FABRIC_VERSION = "6.0.0";

// Launch the supabase DB (with the seed data) before running this tests.
// The official frames can't be changed even by the admin, so the seed data is used as it is.
let firstUser: TestUser;
let secondUser: TestUser;
let userIds: string[] = [];

const createUserOrThrow = async (): Promise<TestUser> => {
  const result = await createTestUser();

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  userIds.push(result.value.createdUserId);

  return {
    client: result.value.authenticatedClient,
    userId: result.value.createdUserId,
  };
};

const getOfficialFrame = async (name: string) => {
  const { data, error } = await adminClient
    .from("canvas_frames")
    .select("id,width,height")
    .is("user_id", null)
    .eq("name", name)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const insertOwnFrameOrThrow = async (
  user: TestUser,
  name: string = `test_${Date.now()}`,
  size: { width: number; height: number } = { width: 800, height: 600 },
) => {
  const { data, error } = await user.client
    .from("canvas_frames")
    .insert({ user_id: user.userId, name, ...size })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Columns that the tests omit on purpose are given by the caller, so the payload is loosely typed.
type SketchPayload = Record<string, unknown>;

const insertSketch = (user: TestUser, payload: SketchPayload = {}) =>
  user.client
    .from("sketches")
    .insert({ fabric_version: FABRIC_VERSION, ...payload } as never)
    .select()
    .single();

const insertSketchOrThrow = async (
  user: TestUser,
  payload: SketchPayload = {},
) => {
  const { data, error } = await insertSketch(user, payload);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

beforeEach(async () => {
  userIds = [];
  firstUser = await createUserOrThrow();
  secondUser = await createUserOrThrow();
});

afterEach(async () => {
  // Sketches and frames must be removed before deleting the users (foreign key).
  // service_role has no privilege on sketches, so each user deletes own sketches.
  for (const user of [firstUser, secondUser]) {
    await user.client.from("sketches").delete().eq("user_id", user.userId);
  }
  await adminClient.from("canvas_frames").delete().in("user_id", userIds);

  for (const userId of userIds) {
    const deleteResult = await deleteTestUser(userId);
    if (!deleteResult.ok) console.log(deleteResult.error);
  }
});

describe("The snapshot trigger on INSERT", () => {
  it("should copy the size of an official frame when only frame_id is given", async () => {
    const laptop = await getOfficialFrame("laptop");

    const sketch = await insertSketchOrThrow(firstUser, {
      frame_id: laptop.id,
    });

    expect(sketch).toMatchObject({
      frame_id: laptop.id,
      width: laptop.width,
      height: laptop.height,
    });
  });

  it("should copy the size of an own frame when only frame_id is given", async () => {
    const ownFrame = await insertOwnFrameOrThrow(firstUser);

    const sketch = await insertSketchOrThrow(firstUser, {
      frame_id: ownFrame.id,
    });

    expect(sketch).toMatchObject({
      frame_id: ownFrame.id,
      width: ownFrame.width,
      height: ownFrame.height,
    });
  });

  it("should keep the given size and set frame_id to null when only width and height are given", async () => {
    const sketch = await insertSketchOrThrow(firstUser, {
      width: 640,
      height: 480,
    });

    expect(sketch).toMatchObject({ frame_id: null, width: 640, height: 480 });
  });

  it("should keep frame_id when frame_id and the matching size are given", async () => {
    const laptop = await getOfficialFrame("laptop");

    const sketch = await insertSketchOrThrow(firstUser, {
      frame_id: laptop.id,
      width: laptop.width,
      height: laptop.height,
    });

    expect(sketch).toMatchObject({
      frame_id: laptop.id,
      width: laptop.width,
      height: laptop.height,
    });
  });

  it("should prefer the given size and set frame_id to null when they don't match", async () => {
    const laptop = await getOfficialFrame("laptop");

    const sketch = await insertSketchOrThrow(firstUser, {
      frame_id: laptop.id,
      width: 800,
      height: 600,
    });

    expect(sketch).toMatchObject({ frame_id: null, width: 800, height: 600 });
  });

  it("should fill in desktop_fhd when nothing is given", async () => {
    const desktopFhd = await getOfficialFrame("desktop_fhd");

    const sketch = await insertSketchOrThrow(firstUser);

    expect(desktopFhd).toMatchObject({ width: 1920, height: 1080 });
    expect(sketch).toMatchObject({
      frame_id: desktopFhd.id,
      width: desktopFhd.width,
      height: desktopFhd.height,
    });
  });

  it("should fill in the official desktop_fhd even if the user has an own frame with the same name", async () => {
    const desktopFhd = await getOfficialFrame("desktop_fhd");
    const ownFrame = await insertOwnFrameOrThrow(firstUser, "desktop_fhd");
    const sketch = await insertSketchOrThrow(firstUser);
    expect(ownFrame.id).not.toBe(desktopFhd.id);
    expect(sketch).toMatchObject({
      frame_id: desktopFhd.id,
      width: desktopFhd.width,
      height: desktopFhd.height,
    });
  });

  it.each([
    ["width", { width: 640 }],
    ["height", { height: 480 }],
  ])("should reject an insert with only %s", async (_label, size) => {
    const { error } = await insertSketch(firstUser, size);

    expect(error?.message).toContain(
      "width and height must be specified together",
    );
  });

  it("should reject a frame_id that doesn't exist", async () => {
    const { error } = await insertSketch(firstUser, {
      frame_id: crypto.randomUUID(),
    });

    expect(error?.message).toContain("canvas_frame");
    expect(error?.message).toContain("not found");
  });

  it("should reject the other user's frame (the trigger is SECURITY INVOKER, so RLS is applied)", async () => {
    const othersFrame = await insertOwnFrameOrThrow(secondUser);

    const { error } = await insertSketch(firstUser, {
      frame_id: othersFrame.id,
    });

    expect(error?.message).toContain("not found");
  });
});

describe("The snapshot trigger on UPDATE", () => {
  it("should copy the size of the new frame when frame_id is changed", async () => {
    const laptop = await getOfficialFrame("laptop");
    const tablet = await getOfficialFrame("tablet_portrait");
    const sketch = await insertSketchOrThrow(firstUser, {
      frame_id: laptop.id,
    });

    const { data, error } = await firstUser.client
      .from("sketches")
      .update({ frame_id: tablet.id } as never)
      .eq("id", sketch.id)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      frame_id: tablet.id,
      width: tablet.width,
      height: tablet.height,
    });
  });

  it("should set frame_id to null when only the size is changed", async () => {
    const laptop = await getOfficialFrame("laptop");
    const sketch = await insertSketchOrThrow(firstUser, {
      frame_id: laptop.id,
    });

    const { data, error } = await firstUser.client
      .from("sketches")
      .update({ width: 640 } as never)
      .eq("id", sketch.id)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      frame_id: null,
      width: 640,
      height: laptop.height,
    });
  });

  it("should detach the frame and keep the size when frame_id is set to null", async () => {
    const laptop = await getOfficialFrame("laptop");
    const sketch = await insertSketchOrThrow(firstUser, {
      frame_id: laptop.id,
    });

    const { data, error } = await firstUser.client
      .from("sketches")
      .update({ frame_id: null } as never)
      .eq("id", sketch.id)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      frame_id: null,
      width: laptop.width,
      height: laptop.height,
    });
  });

  it("should not change frame_id and the size when other columns are updated", async () => {
    const laptop = await getOfficialFrame("laptop");
    const sketch = await insertSketchOrThrow(firstUser, {
      frame_id: laptop.id,
    });

    const { data, error } = await firstUser.client
      .from("sketches")
      .update({ title: "Renamed" })
      .eq("id", sketch.id)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      title: "Renamed",
      frame_id: laptop.id,
      width: laptop.width,
      height: laptop.height,
    });
  });

  // upsert
  it("should update only the given columns on an upsert of an existing row", async () => {
    const laptop = await getOfficialFrame("laptop");
    const sketch = await insertSketchOrThrow(firstUser, {
      frame_id: laptop.id,
    });

    const { data, error } = await firstUser.client
      .from("sketches")
      // width and height are filled by the trigger, so they are omitted on purpose.
      .upsert({
        id: sketch.id,
        title: "Upserted",
        fabric_version: FABRIC_VERSION,
      } as never)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      title: "Upserted",
      frame_id: laptop.id,
      width: laptop.width,
      height: laptop.height,
    });
  });
});

describe("The constraints and the defaults of sketches", () => {
  it("should use 20 as the default of cell_size", async () => {
    const sketch = await insertSketchOrThrow(firstUser);

    expect(sketch.cell_size).toBe(20);
  });

  it.each([3, 201])("should reject cell_size = %i", async (cellSize) => {
    const { error } = await insertSketch(firstUser, { cell_size: cellSize });

    expect(error?.code).toBe(PG_CHECK_VIOLATION);
  });

  it.each([4, 200])("should accept cell_size = %i", async (cellSize) => {
    const { data, error } = await insertSketch(firstUser, {
      cell_size: cellSize,
    });

    expect(error).toBeNull();
    expect(data?.cell_size).toBe(cellSize);
  });

  it.each([
    ["width", 319],
    ["width", 1921],
    ["height", 319],
    ["height", 1921],
  ])("should reject %s = %i", async (column, value) => {
    const { error } = await insertSketch(firstUser, {
      width: 600,
      height: 600,
      [column]: value,
    });

    expect(error?.code).toBe(PG_CHECK_VIOLATION);
  });

  it.each([
    ["width", 320],
    ["width", 1920],
    ["height", 320],
    ["height", 1920],
  ])("should accept %s = %i", async (column, value) => {
    const { error } = await insertSketch(firstUser, {
      width: 600,
      height: 600,
      [column]: value,
    });

    expect(error).toBeNull();
  });

  // The divisible responsibilty lies with the client logic.
  it("should not reject a size that is not divisible by cell_size", async () => {
    const { data, error } = await insertSketch(firstUser, {
      width: 650,
      height: 470,
      cell_size: 20,
    });

    expect(error).toBeNull();
    expect(data).toMatchObject({ width: 650, height: 470, cell_size: 20 });
  });

  it("should use the defaults of title and canvas_json", async () => {
    const sketch = await insertSketchOrThrow(firstUser);

    expect(sketch.title).toBe("Untitled");
    expect(sketch.canvas_json).toEqual({});
  });

  it("should reject an insert without fabric_version", async () => {
    const { error } = await firstUser.client
      .from("sketches")
      .insert({} as never)
      .select()
      .single();

    expect(error?.code).toBe(PG_NOT_NULL_VIOLATION);
  });

  it("should set frame_id to null and keep the size when the frame is deleted", async () => {
    const ownFrame = await insertOwnFrameOrThrow(firstUser);
    const sketch = await insertSketchOrThrow(firstUser, {
      frame_id: ownFrame.id,
    });

    const { error: deleteError } = await firstUser.client
      .from("canvas_frames")
      .delete()
      .eq("id", ownFrame.id);

    expect(deleteError).toBeNull();

    const { data } = await firstUser.client
      .from("sketches")
      .select()
      .eq("id", sketch.id)
      .single();

    expect(data).toMatchObject({
      frame_id: null,
      width: ownFrame.width,
      height: ownFrame.height,
    });
  });
});
