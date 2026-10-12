import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envSchema } from "@/supabase/sketch-crud/handleDb.types";

// For Server Actions only. Unlike `createSupabaseServerClient`, this client can write cookies,
// so that a session created in the action (e.g. anonymous sign-in) is sent back in the response.
const createSupabaseActionClient = async () => {
  const cookieStore = await cookies();

  const processEnv = envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  return createServerClient(
    processEnv.NEXT_PUBLIC_SUPABASE_URL,
    processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};

export { createSupabaseActionClient };
