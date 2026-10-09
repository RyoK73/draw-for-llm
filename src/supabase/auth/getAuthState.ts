import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";

type AuthState = "signedOut" | "guest" | "registered";

const getAuthState = async (
  supabaseClient: SupabaseClient,
): Promise<AuthState> => {
  const { data, error: getClaimsError } = await supabaseClient.auth.getClaims();

  // Leave the process to Next.js when getClaimsError occurs.
  if (getClaimsError) throw getClaimsError;
  if (!data?.claims) return "signedOut";
  return data.claims.is_anonymous ? "guest" : "registered";
};

export { getAuthState };
export type { AuthState };
