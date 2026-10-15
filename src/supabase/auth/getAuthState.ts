import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

type AuthState = "signedOut" | "guest" | "registered";

const getAuthState = async (
  supabaseClient: SupabaseClient<DatabaseModified>,
): Promise<AuthState> => {
  const { data, error: getClaimsError } = await supabaseClient.auth.getClaims();

  // Leave the process to Next.js when getClaimsError occurs.
  if (getClaimsError) throw getClaimsError;
  if (!data?.claims) return "signedOut";
  return data.claims.is_anonymous ? "guest" : "registered";
};

export { getAuthState };
export type { AuthState };
