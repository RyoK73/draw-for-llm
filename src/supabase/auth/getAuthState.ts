import "server-only";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";

type AuthState = "signedOut" | "guest" | "registered";

const getAuthState = async (): Promise<AuthState> => {
  const supabaseClient = await createSupabaseServerClient();
  const { data, error: getClaimsError } = await supabaseClient.auth.getClaims();

  // Leave the process to Next.js when getClaimsError occurs.
  if (getClaimsError) throw getClaimsError;
  if (!data?.claims) return "signedOut";
  return data.claims.is_anonymous ? "guest" : "registered";
};

export { getAuthState };
export type { AuthState };
