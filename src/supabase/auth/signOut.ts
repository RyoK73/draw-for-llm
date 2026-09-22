import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";
import { Result } from "@/utils/utility.types";

const signOut = async (): Promise<Result<void>> => {
  const supabaseClient = createSupabaseBrowserClient();
  const { error: signOutError } = await supabaseClient.auth.signOut();
  if (signOutError) ({ ok: false, error: signOutError });
  return { ok: true, value: undefined };
};

export { signOut };
