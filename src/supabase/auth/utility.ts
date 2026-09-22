import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";
import { Result } from "@/utils/utility.types";

const updateUser = async (email: string): Promise<Result<void>> => {
  const supabaseClient = createSupabaseBrowserClient();
  const { error: updateEmailError } = await supabaseClient.auth.updateUser({
    email: email,
  });

  if (updateEmailError) return { ok: false, error: updateEmailError };
  return { ok: true, value: undefined };
};

export { updateUser, updateUser as changeUserEmail };
