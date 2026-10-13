import { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/utils/utility.types";

const signOut = async (
  supabaseClient: SupabaseClient,
): Promise<Result<void>> => {
  const { error: signOutError } = await supabaseClient.auth.signOut();
  if (signOutError) return { ok: false, error: signOutError };
  return { ok: true, value: undefined };
};

export { signOut };
