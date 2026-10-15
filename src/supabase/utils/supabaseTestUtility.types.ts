import z from "zod";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const testEnvSchema = z.object({
  SUPABASE_LOCAL_URL: z.string(),
  SUPABASE_LOCAL_ADMIN_KEY: z.string(),
  SUPABASE_LOCAL_ANON_KEY: z.string(),
});

type CreatedTestUser = {
  createdUserId: string;
  authenticatedClient: ReturnType<typeof createClient<DatabaseModified>>;
};

type TestUser = { client: SupabaseClient<DatabaseModified>; userId: string };

export { testEnvSchema };
export type { CreatedTestUser, TestUser };
