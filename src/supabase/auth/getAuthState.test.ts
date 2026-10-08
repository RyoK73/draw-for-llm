import { getAuthState } from "@/supabase/auth/getAuthState";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { supabaseTestHelper } from "@/supabase/utils/supabaseTestUtility";

vi.mock("@/supabase/utils/serverClient", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const helper = supabaseTestHelper();
const userTracker = helper.createTestUserTracker();

// Launch the supabase DB before running this tests.
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
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      helper.createAnonClient(),
    );

    expect(await getAuthState()).toBe("signedOut");
  });

  it("should return guest when a client signs in anonymously", async () => {
    const client = helper.createAnonClient();
    const { data, error } = await client.auth.signInAnonymously();
    // Keep the id before the assertions, so that the user is deleted even if an assertion fails.
    anonymousUserId = data.user?.id;
    expect(error).toBeNull();

    vi.mocked(createSupabaseServerClient).mockResolvedValue(client);

    expect(await getAuthState()).toBe("guest");
  });

  it("should return registered when a client signs in as a permanent user", async () => {
    const user = await userTracker.create();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(user.client);

    expect(await getAuthState()).toBe("registered");
  });

  it("should throw when getClaims returns an error", async () => {
    const claimsError = new Error("getClaims failed");
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getClaims: async () => ({ data: null, error: claimsError }) },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    await expect(getAuthState()).rejects.toThrow("getClaims failed");
  });
});
