import { getAuthState } from "@/supabase/auth/getAuthState";
import type { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";

const helper = supabaseTestHelper();
const userTracker = helper.createTestUserTracker();
const client = helper.createAnonClient();

// Launch the supabase DB before running these tests.
// Call `signInAnonymously` only once per test because of the per-IP rate limit of anonymous sign-ins.
let anonymousUserId: string | undefined;

beforeEach(() => {
  userTracker.reset();
});

afterEach(async () => {
  vi.resetAllMocks();
  await userTracker.deleteAll();

  if (!anonymousUserId) return;

  const deleteResult = await helper.deleteTestUser(anonymousUserId);
  if (!deleteResult.ok) console.log(deleteResult.error);

  anonymousUserId = undefined;
});

describe("getAuthState", () => {
  it("should return signedOut when a client has no session", async () => {
    expect(await getAuthState(client)).toBe("signedOut");
  });

  it("should return guest when a client signs in anonymously", async () => {
    const { data, error } = await client.auth.signInAnonymously();
    // Keep the id before the assertions, so that the user is deleted even if an assertion fails.
    anonymousUserId = data.user?.id;
    expect(error).toBeNull();
    expect(await getAuthState(client)).toBe("guest");
  });

  it("should return registered when a client signs in as a permanent user", async () => {
    const user = await userTracker.create();
    expect(await getAuthState(user.client)).toBe("registered");
  });

  it("should throw when getClaims returns an error", async () => {
    type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

    const claimsError = new Error("getClaims failed");
    const fakeClient = {
      auth: { getClaims: async () => ({ data: null, error: claimsError }) },
    } as unknown as ServerClient;

    await expect(getAuthState(fakeClient)).rejects.toThrow("getClaims failed");
  });
});
