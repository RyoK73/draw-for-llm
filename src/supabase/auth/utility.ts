import { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/utils/utility.types";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

const updateUser = async (
  supabaseClient: SupabaseClient<DatabaseModified>,
  email: string,
): Promise<Result<void>> => {
  const { error: updateEmailError } = await supabaseClient.auth.updateUser({
    email: email,
  });

  if (updateEmailError) return { ok: false, error: updateEmailError };
  return { ok: true, value: undefined };
};

export { updateUser, updateUser as changeUserEmail };
