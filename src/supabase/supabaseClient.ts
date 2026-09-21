import { createClient } from "@supabase/supabase-js";
import { envSchema } from "@/supabase/sketch-crud/handleDb.types";

const createClientComponentClient = () => {
  const processEnv = envSchema.parse(process.env);

  return createClient(
    processEnv.NEXT_PUBLIC_SUPABASE_URL,
    processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
};

export default createClientComponentClient;
