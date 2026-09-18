import { createClient } from "@supabase/supabase-js";

const supabaseCreateClient = createClient(
  process.env.SUPABASE_URL ?? "http://127.0.0.1:54321", // This is for local development
  process.env.SUPABASE_ANON_KEY ??
    "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH", // This is for local development
);

export default { supabaseCreateClient };
