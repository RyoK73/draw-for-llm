import { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/utils/utility.types";

const updateUser = async (
  supabaseClient: SupabaseClient,
): Promise<Result<void>> => {
  const { error: updateEmailError } = await supabaseClient.auth.updateUser({
    email: email,
  });

  if (updateEmailError) return { ok: false, error: updateEmailError };
  return { ok: true, value: undefined };
};

export { updateUser, updateUser as changeUserEmail };
