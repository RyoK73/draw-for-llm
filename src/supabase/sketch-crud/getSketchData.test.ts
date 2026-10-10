import { getSketchData } from "@/supabase/sketch-crud/getSketchData";
import { getFabricVersion } from "@/supabase/sketch-crud/serverUtility";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";
import { TestUser } from "@/supabase/utils/supabaseTestUtility.types";

const helper = supabaseTestHelper();
const userTracker = helper.createTestUserTracker();

let firstUser: TestUser;
let secondUser: TestUser;

const insertSketchOrThrow = async (user: TestUser, title: string) => {
  const { data, error } = await user.client
    .from("sketches")
    .insert({
      canvas_json: "test",
      description: `description of ${title}`,
      title,
      fabric_version: getFabricVersion(),
      width: 800,
      height: 600,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
};

// Launch the supabase DB before running this tests.
beforeEach(async () => {
  userTracker.reset();
  firstUser = await userTracker.create();
  secondUser = await userTracker.create();
});

afterEach(async () => {
  await userTracker.deleteAll();
});

describe("getSketchData", () => {
  test("should return an error when a client fetches by ANON_KEY", async () => {
    await insertSketchOrThrow(firstUser, "sketch");

    const getResult = await getSketchData(helper.createAnonClient());

    expect(getResult.ok).toBe(false);
  });

  test("should return an empty array when the user has no sketches", async () => {
    const getResult = await getSketchData(firstUser.client);

    expect(getResult).toEqual({ ok: true, value: [] });
  });

  test("should return sketches in descending order of updated_at", async () => {
    const oldestId = await insertSketchOrThrow(firstUser, "oldest");
    const middleId = await insertSketchOrThrow(firstUser, "middle");
    const newestId = await insertSketchOrThrow(firstUser, "newest");

    // Updating the oldest sketch makes it the most recently updated one.
    const { error } = await firstUser.client
      .from("sketches")
      .update({ title: "oldest (updated)" })
      .eq("id", oldestId);
    if (error) throw error;

    const getResult = await getSketchData(firstUser.client);

    if (!getResult.ok) throw getResult.error;
    expect(getResult.value.map((sketch) => sketch.id)).toEqual([
      oldestId,
      newestId,
      middleId,
    ]);
  });

  test("should return { id, title, description, created_at, updated_at } without canvas_json", async () => {
    await insertSketchOrThrow(firstUser, "sketch");

    const getResult = await getSketchData(firstUser.client);

    if (!getResult.ok) throw getResult.error;
    expect(getResult.value).toHaveLength(1);
    expect(Object.keys(getResult.value[0]).sort()).toEqual([
      "created_at",
      "description",
      "id",
      "title",
      "updated_at",
    ]);
  });

  test("should not return sketches of other users", async () => {
    await insertSketchOrThrow(firstUser, "first user's sketch");
    const secondId = await insertSketchOrThrow(
      secondUser,
      "second user's sketch",
    );

    const getResult = await getSketchData(secondUser.client);

    if (!getResult.ok) throw getResult.error;
    expect(getResult.value.map((sketch) => sketch.id)).toEqual([secondId]);
  });
});
