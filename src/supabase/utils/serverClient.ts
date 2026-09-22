import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envSchema } from "@/supabase/sketch-crud/handleDb.types";

const createSupabaseServerClient = async () => {
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
      },
    },
  );
};

export { createSupabaseServerClient };
