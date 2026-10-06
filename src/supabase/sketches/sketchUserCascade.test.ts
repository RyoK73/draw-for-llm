import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";
import { insertSketchOrThrow } from "@/supabase/utils/sketchTestUtility";
import { TestUser } from "@/supabase/utils/supabaseTestUtility.types";

const helper = supabaseTestHelper();
const { adminClient } = helper;
const userTracker = helper.createTestUserTracker();

// Launch the supabase DB before running this tests.
let firstUser: TestUser;
let secondUser: TestUser;

beforeEach(async () => {
  userTracker.reset();
  firstUser = await userTracker.create();
  secondUser = await userTracker.create();
});

afterEach(async () => {
  await userTracker.deleteAll();
});

describe("sketches.user_id ON DELETE CASCADE", () => {
  it("should delete the user's sketches and keep the other user's sketches when the user is deleted", async () => {
    await insertSketchOrThrow(firstUser);
    await insertSketchOrThrow(secondUser);

    // The deletion fails with a foreign key violation unless the cascade is set.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      firstUser.userId,
    );

    expect(deleteError).toBeNull();

    const { data: firstUserSketches } = await firstUser.client
      .from("sketches")
      .select("id")
      .eq("user_id", firstUser.userId);

    expect(firstUserSketches).toHaveLength(0);

    const { data: secondUserSketches } = await secondUser.client
      .from("sketches")
      .select("id")
      .eq("user_id", secondUser.userId);

    expect(secondUserSketches).toHaveLength(1);
  });
});
