import { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/utils/utility.types";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

const signOut = async (
  supabaseClient: SupabaseClient<DatabaseModified>,
): Promise<Result<void>> => {
  const { error: signOutError } = await supabaseClient.auth.signOut();
  if (signOutError) return { ok: false, error: signOutError };
  return { ok: true, value: undefined };
};

export { signOut };
