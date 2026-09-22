import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";
import { Result } from "@/utils/utility.types";

const changeUserEmail = async (email: string): Promise<Result<void>> => {
  const supabaseClient = createSupabaseBrowserClient();
  const { error: updateEmailError } = await supabaseClient.auth.updateUser({
    email: email,
  });

  if (updateEmailError) ({ ok: false, error: updateEmailError });
  return { ok: true, value: undefined };
};

export { changeUserEmail };
