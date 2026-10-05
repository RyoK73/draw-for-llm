import z from "zod";
import { Database } from "@/supabase/utils/database.types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const testEnvSchema = z.object({
  SUPABASE_LOCAL_URL: z.string(),
  SUPABASE_LOCAL_ADMIN_KEY: z.string(),
  SUPABASE_LOCAL_ANON_KEY: z.string(),
});

type CreatedTestUser = {
  createdUserId: string;
  authenticatedClient: ReturnType<typeof createClient<Database>>;
};

type TestUser = { client: SupabaseClient<Database>; userId: string };

export { testEnvSchema };
export type { CreatedTestUser, TestUser };
