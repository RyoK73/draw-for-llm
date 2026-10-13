import { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { getAuthState } from "@/supabase/auth/getAuthState";
import { AuthForm, type AuthFormProps } from "@/auth-form/auth-form";

const AuthPage = async ({ mode }: Pick<AuthFormProps, "mode">) => {
  const supabaseClient = await createSupabaseServerClient();
  const authState = await getAuthState(supabaseClient);

  return <AuthForm mode={mode} isGuest={authState === "guest"} />;
};

export { AuthPage };
