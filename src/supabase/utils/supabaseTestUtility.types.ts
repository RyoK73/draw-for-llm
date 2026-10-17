import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type CreatedTestUser = {
  createdUserId: string;
  authenticatedClient: ReturnType<typeof createClient<DatabaseModified>>;
};

type TestUser = { client: SupabaseClient<DatabaseModified>; userId: string };

export type { CreatedTestUser, TestUser };
