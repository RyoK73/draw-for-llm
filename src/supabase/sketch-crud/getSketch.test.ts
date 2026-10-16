import { getSketch } from "@/supabase/sketch-crud/getSketch";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";
import { TestUser } from "@/supabase/utils/supabaseTestUtility.types";
import { insertSketchOrThrow } from "@/supabase/utils/sketchTestUtility";

const helper = supabaseTestHelper();
const userTracker = helper.createTestUserTracker();

let firstUser: TestUser;
let secondUser: TestUser;

// Launch the supabase DB before running this tests.
beforeEach(async () => {
  userTracker.reset();
  firstUser = await userTracker.create();
  secondUser = await userTracker.create();
});

afterEach(async () => {
  await userTracker.deleteAll();
});

describe("getSketch", () => {
  test("should return the own sketch with the columns to restore the canvas", async () => {
    const canvasJson = { version: "7.4.0", objects: [] };
    const sketch = await insertSketchOrThrow(firstUser, {
      title: "mine",
      description: "my description",
      width: 800,
      height: 600,
      canvas_json: canvasJson,
      cell_size: 16,
      fabric_version: "7.4.0",
    });

    const getResult = await getSketch(firstUser.client, sketch.id);

    expect(getResult.ok).toBe(true);
    if (!getResult.ok) throw getResult.error;
    expect(getResult.value).toMatchObject({
      id: sketch.id,
      title: "mine",
      description: "my description",
      width: 800,
      height: 600,
      canvas_json: canvasJson,
      cell_size: 16,
      frame_id: sketch.frame_id,
      fabric_version: "7.4.0",
    });
  });

  test("should return null for another user's sketch", async () => {
    const sketch = await insertSketchOrThrow(firstUser);

    const getResult = await getSketch(secondUser.client, sketch.id);

    expect(getResult).toEqual({ ok: true, value: null });
  });

  test("should return null when the id does not exist", async () => {
    const getResult = await getSketch(firstUser.client, crypto.randomUUID());

    expect(getResult).toEqual({ ok: true, value: null });
  });

  test("should return an error when a client fetches by ANON_KEY", async () => {
    const sketch = await insertSketchOrThrow(firstUser);

    const getResult = await getSketch(helper.createAnonClient(), sketch.id);

    expect(getResult.ok).toBe(false);
  });

  test("should return an error when the id is not a uuid", async () => {
    const getResult = await getSketch(firstUser.client, "xxxxxxxxxxxxxxxx");

    expect(getResult.ok).toBe(false);
  });
});
