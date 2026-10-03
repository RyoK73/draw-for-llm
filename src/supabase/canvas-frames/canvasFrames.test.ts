import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/utils/database.types";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";

const helper = supabaseTestHelper();
const { createTestUser, deleteTestUser } = helper;

// The helper returns untyped clients, so they are typed here to use the table types.
type TestClient = SupabaseClient<Database>;

const adminClient = helper.adminClient;
const createAnonClient = () => helper.createAnonClient();

type TestUser = { client: TestClient; userId: string };

const OFFICIAL_PRESETS = [
  { name: "desktop_fhd", width: 1920, height: 1080 },
  { name: "laptop", width: 1440, height: 900 },
  { name: "tablet_portrait", width: 768, height: 1024 },
  { name: "tablet_landscape", width: 1024, height: 768 },
  { name: "mobile_portrait", width: 390, height: 844 },
  { name: "mobile_landscape", width: 844, height: 390 },
  { name: "mobile_small", width: 320, height: 568 },
];

const PG_RLS_VIOLATION = "42501";
const PG_UNIQUE_VIOLATION = "23505";
const PG_CHECK_VIOLATION = "23514";

// Launch the supabase DB before running this tests.
let firstUser: TestUser;
let secondUser: TestUser;
let officialNames: string[];

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

const createOwnFrame = (
  userId: string,
  name: string = `test_${Date.now()}`,
) => ({
  user_id: userId,
  name,
  width: 800,
  height: 600,
});

const insertOwnFrameOrThrow = async (user: TestUser) => {
  const { data, error } = await user.client
    .from("canvas_frames")
    .insert(createOwnFrame(user.userId))
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

beforeEach(async () => {
  userIds = [];
  firstUser = await createUserOrThrow();
  secondUser = await createUserOrThrow();
  officialNames = [];
});

afterEach(async () => {
  // Test frames must be removed before deleting the users (foreign key).
  await adminClient.from("canvas_frames").delete().in("user_id", userIds);

  if (officialNames.length > 0) {
    await adminClient.from("canvas_frames").delete().in("name", officialNames);
  }

  for (const userId of userIds) {
    const deleteResult = await deleteTestUser(userId);
    if (!deleteResult.ok) console.log(deleteResult.error);
  }
});

describe("The seed data of the official presets", () => {
  it("should be readable by an authenticated user and match the expected sizes", async () => {
    const { data, error } = await firstUser.client
      .from("canvas_frames")
      .select("name,width,height")
      .is("user_id", null);

    expect(error).toBeNull();
    expect(data).toEqual(expect.arrayContaining(OFFICIAL_PRESETS));
  });
});

describe("Is RLS working?", () => {
  it("should return an error when a client selects by ANON_KEY", async () => {
    const { error } = await createAnonClient()
      .from("canvas_frames")
      .select("name");

    expect(error).not.toBeNull();
  });

  it("should not let a user see the other user's frames", async () => {
    const inserted = await insertOwnFrameOrThrow(firstUser);

    const { data, error } = await secondUser.client
      .from("canvas_frames")
      .select("id")
      .eq("id", inserted.id);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("should let a user insert, update, and delete own frames", async () => {
    const inserted = await insertOwnFrameOrThrow(firstUser);

    expect(inserted.user_id).toBe(firstUser.userId);

    const { data: updated, error: updateError } = await firstUser.client
      .from("canvas_frames")
      .update({ width: 1000 })
      .eq("id", inserted.id)
      .select()
      .single();

    expect(updateError).toBeNull();
    expect(updated?.width).toBe(1000);

    const { data: deleted, error: deleteError } = await firstUser.client
      .from("canvas_frames")
      .delete()
      .eq("id", inserted.id)
      .select();

    expect(deleteError).toBeNull();
    expect(deleted).toHaveLength(1);
  });

  it("should reject an insert with the other user's id", async () => {
    const { error } = await firstUser.client
      .from("canvas_frames")
      .insert(createOwnFrame(secondUser.userId));

    expect(error?.code).toBe(PG_RLS_VIOLATION);
  });

  it("should reject an insert of an official frame (user_id is null) by an authenticated user", async () => {
    const { error } = await firstUser.client
      .from("canvas_frames")
      .insert({ ...createOwnFrame(firstUser.userId), user_id: null });

    expect(error?.code).toBe(PG_RLS_VIOLATION);
  });

  it("should not let a user update an official frame", async () => {
    const { data } = await firstUser.client
      .from("canvas_frames")
      .update({ width: 1000 })
      .is("user_id", null)
      .eq("name", "laptop")
      .select();

    // Official rows are visible but not updatable, so no row is affected.
    expect(data).toEqual([]);

    const { data: official } = await adminClient
      .from("canvas_frames")
      .select("width")
      .is("user_id", null)
      .eq("name", "laptop")
      .single();

    expect(official?.width).toBe(1440);
  });

  it("should not let a user delete an official frame", async () => {
    const { data } = await firstUser.client
      .from("canvas_frames")
      .delete()
      .is("user_id", null)
      .eq("name", "laptop")
      .select();

    expect(data).toEqual([]);

    const { data: official } = await adminClient
      .from("canvas_frames")
      .select("name")
      .is("user_id", null)
      .eq("name", "laptop");

    expect(official).toHaveLength(1);
  });

  it("should not let a user update the other user's frame", async () => {
    const inserted = await insertOwnFrameOrThrow(firstUser);

    const { data, error } = await secondUser.client
      .from("canvas_frames")
      .update({ width: 1000 })
      .eq("id", inserted.id)
      .select();

    // The row is invisible to the other user, so no row is affected.
    expect(error).toBeNull();
    expect(data).toEqual([]);

    const { data: row } = await adminClient
      .from("canvas_frames")
      .select("width")
      .eq("id", inserted.id)
      .single();

    expect(row?.width).toBe(inserted.width);
  });

  it("should not let a user delete the other user's frame", async () => {
    const inserted = await insertOwnFrameOrThrow(firstUser);

    const { data, error } = await secondUser.client
      .from("canvas_frames")
      .delete()
      .eq("id", inserted.id)
      .select();

    expect(error).toBeNull();
    expect(data).toEqual([]);

    const { data: rows } = await adminClient
      .from("canvas_frames")
      .select("id")
      .eq("id", inserted.id);

    expect(rows).toHaveLength(1);
  });

  it("should reject changing user_id to the other user's id", async () => {
    const inserted = await insertOwnFrameOrThrow(firstUser);

    const { error } = await firstUser.client
      .from("canvas_frames")
      .update({ user_id: secondUser.userId })
      .eq("id", inserted.id);

    expect(error?.code).toBe(PG_RLS_VIOLATION);

    const { data: row } = await adminClient
      .from("canvas_frames")
      .select("user_id")
      .eq("id", inserted.id)
      .single();

    expect(row?.user_id).toBe(firstUser.userId);
  });

  it("should reject changing user_id to null", async () => {
    const inserted = await insertOwnFrameOrThrow(firstUser);

    const { error } = await firstUser.client
      .from("canvas_frames")
      .update({ user_id: null })
      .eq("id", inserted.id);

    expect(error?.code).toBe(PG_RLS_VIOLATION);

    const { data: row } = await adminClient
      .from("canvas_frames")
      .select("user_id")
      .eq("id", inserted.id)
      .single();

    expect(row?.user_id).toBe(firstUser.userId);
  });
});

describe("The CHECK constraint of width and height", () => {
  it.each([
    ["width", 319],
    ["width", 1921],
    ["height", 319],
    ["height", 1921],
  ])("should reject %s = %i", async (column, value) => {
    const { error } = await firstUser.client
      .from("canvas_frames")
      .insert({ ...createOwnFrame(firstUser.userId), [column]: value });

    expect(error?.code).toBe(PG_CHECK_VIOLATION);
  });

  it.each([
    ["width", 320],
    ["width", 1920],
    ["height", 320],
    ["height", 1920],
  ])("should accept %s = %i", async (column, value) => {
    const { error } = await firstUser.client
      .from("canvas_frames")
      .insert({ ...createOwnFrame(firstUser.userId), [column]: value });

    expect(error).toBeNull();
  });
});

describe("The CHECK constraint of name", () => {
  it.each([
    ["an empty string", ""],
    ["101 characters", "a".repeat(101)],
  ])("should reject %s", async (_label, name) => {
    const { error } = await firstUser.client
      .from("canvas_frames")
      .insert(createOwnFrame(firstUser.userId, name));

    expect(error?.code).toBe(PG_CHECK_VIOLATION);
  });
  it.each([
    ["1 character", "a"],
    ["100 characters", "a".repeat(100)],
  ])("should accept %s", async (_label, name) => {
    const { error } = await firstUser.client
      .from("canvas_frames")
      .insert(createOwnFrame(firstUser.userId, name));

    expect(error).toBeNull();
  });
});

describe("The unique constraint of name", () => {
  it("should reject a duplicated name among official frames", async () => {
    const name = `official_${Date.now()}`;
    officialNames.push(name);

    const frame = { user_id: null, name, width: 800, height: 600 };

    const { error: firstError } = await adminClient
      .from("canvas_frames")
      .insert(frame);
    const { error: secondError } = await adminClient
      .from("canvas_frames")
      .insert(frame);

    expect(firstError).toBeNull();
    expect(secondError?.code).toBe(PG_UNIQUE_VIOLATION);
  });

  it("should accept the same name for different users", async () => {
    const name = `shared_${Date.now()}`;

    const { error: firstError } = await firstUser.client
      .from("canvas_frames")
      .insert(createOwnFrame(firstUser.userId, name));
    const { error: secondError } = await secondUser.client
      .from("canvas_frames")
      .insert(createOwnFrame(secondUser.userId, name));

    expect(firstError).toBeNull();
    expect(secondError).toBeNull();
  });
});
