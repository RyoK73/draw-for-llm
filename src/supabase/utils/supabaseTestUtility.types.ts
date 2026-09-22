import z from "zod";
import { createClient } from "@supabase/supabase-js";

const testEnvSchema = z.object({
  SUPABASE_LOCAL_URL: z.string(),
  SUPABASE_LOCAL_ADMIN_KEY: z.string(),
  SUPABASE_LOCAL_ANON_KEY: z.string(),
});

type CreatedTestUser = {
  createdUserId: string;
  authenticatedClient: ReturnType<typeof createClient>;
};

export { testEnvSchema };
export type { CreatedTestUser };
