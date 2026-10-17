import { createBrowserClient } from "@supabase/ssr";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";
import { parsePublicEnv } from "@/supabase/utils/env";

const createSupabaseBrowserClient = () => {
  const publicEnv = parsePublicEnv();
  return createBrowserClient<DatabaseModified>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
};

export { createSupabaseBrowserClient };
