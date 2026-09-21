import { createBrowserClient } from "@supabase/ssr";
import { envSchema } from "@/supabase/sketch-crud/handleDb.types";

const createBrowerClient = () => {
  const processEnv = envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  return createBrowserClient(
    processEnv.NEXT_PUBLIC_SUPABASE_URL,
    processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
};

export default createBrowerClient;
