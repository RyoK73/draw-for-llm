import { createClient } from "@supabase/supabase-js";
import {
  testEnvSchema,
  TestUser,
} from "@/supabase/utils/supabaseTestUtility.types";
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

  // The adminClient is used only for the auth admin API. The service_role has no privilege on the public tables.
  const adminClient = createTestClient("admin");

  const createAnonClient = (): ReturnType<typeof createClient<Database>> =>
    createTestClient("anon");

  const createTestUser = async (): Promise<Result<CreatedTestUser>> => {
    // Test files run in parallel, so Date.now() alone can collide.
    const email = `${Date.now()}-${crypto.randomUUID()}@test.com`;
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

  // Records only the users whose creation succeeded, so that the cleanup never touches a missing user.
  const createTestUserTracker = () => {
    let users: TestUser[] = [];

    const create = async (): Promise<TestUser> => {
      const result = await createTestUser();

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      const user = {
        client: result.value.authenticatedClient,
        userId: result.value.createdUserId,
      };
      users.push(user);

      return user;
    };

    const reset = () => {
      users = [];
    };

    const deleteAll = async () => {
      for (const { userId } of users) {
        const deleteResult = await deleteTestUser(userId);
        if (!deleteResult.ok) console.log(deleteResult.error);
      }
    };

    return {
      create,
      reset,
      deleteAll,
      get users(): readonly TestUser[] {
        return users;
      },
    };
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

  return {
    createAnonClient,
    createTestUser,
    deleteTestUser,
    createTestUserTracker,
    insertOwnFrameOrThrow,
  };
};

export { supabaseTestHelper };
