import { signInAnonymously } from "@/supabase/auth/signIn";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";

const helper = supabaseTestHelper();

// Launch the supabase DB before running this tests.
// Running this test repeatedly in a short time may fail because of the per-IP rate limit of anonymous sign-ins.
// So call `signInAnonymously` only once per test.
let createdUserId: string | undefined;

afterEach(async () => {
  if (!createdUserId) return;

  const deleteResult = await helper.deleteTestUser(createdUserId);
  if (!deleteResult.ok) console.log(deleteResult.error);

  createdUserId = undefined;
});

describe("signInAnonymously", () => {
  test("should sign in with the given client", async () => {
    const client = helper.createAnonClient();

    const result = await signInAnonymously(client);
    // Keep the id before the assertions, so that the user is deleted even if an assertion fails.
    const { data } = await client.auth.getSession();
    createdUserId = data.session?.user.id;

    expect(result).toEqual({ ok: true, value: undefined });
    expect(data.session?.user.is_anonymous).toBe(true);
  });
});
