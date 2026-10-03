import { createClient } from "@supabase/supabase-js";
import { testEnvSchema } from "@/supabase/utils/supabaseTestUtility.types";
import { CreatedTestUser } from "@/supabase/utils/supabaseTestUtility.types";
import { Result } from "@/utils/utility.types";
import { Database } from "@/supabase/utils/database.types";

// helper function
const supabaseTestHelper = () => {
  const processEnv = testEnvSchema.parse(process.env);

  const createTestClient = (
    role: "anon" | "admin" = "anon",
  ): ReturnType<typeof createClient<Database>> => {
    let key = processEnv.SUPABASE_LOCAL_ANON_KEY;

    if (role === "admin") key = processEnv.SUPABASE_LOCAL_ADMIN_KEY;

    return createClient(processEnv.SUPABASE_LOCAL_URL, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storageKey: `test-client-${Date.now()}`,
      },
    });
  };

  const adminClient = createTestClient("admin");

  const createAnonClient = (): ReturnType<typeof createClient<Database>> =>
    createTestClient("anon");

  const createTestUser = async (): Promise<Result<CreatedTestUser>> => {
    const email = `${Date.now()}xxxx@test.com`;
    const password = "xxxxxxxxx";

    const { error: createdUserError } = await adminClient.auth.admin.createUser(
      {
        email: email,
        password: password,
        email_confirm: true,
      },
    );

    if (createdUserError) {
      return { ok: false, error: new Error(createdUserError.message) };
    }

    const authenticatedClient = createTestClient("anon");

    const { data: signInData, error: signInError } =
      await authenticatedClient.auth.signInWithPassword({
        email: email,
        password: password,
      });

    if (signInError) {
      return { ok: false, error: new Error(signInError.message) };
    }

    return {
      ok: true,
      value: {
        createdUserId: signInData.user.id,
        authenticatedClient,
      },
    };
  };

  const deleteTestUser = async (userId: string): Promise<Result<void>> => {
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      return { ok: false, error: new Error(error.message) };
    }

    return { ok: true, value: undefined };
  };

  return { adminClient, createAnonClient, createTestUser, deleteTestUser };
};

export { supabaseTestHelper };
