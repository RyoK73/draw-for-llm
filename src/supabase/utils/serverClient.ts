import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";
import { parsePublicEnv } from "@/supabase/utils/env";

const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  const publicEnv = parsePublicEnv();
  return createServerClient<DatabaseModified>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );
};

export { createSupabaseServerClient };
