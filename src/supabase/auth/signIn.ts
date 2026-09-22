import { Result } from "@/utils/utility.types";
import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";

const signInWithOTP = async (
  email: string,
  emailRedirectTo: string,
): Promise<Result<void>> => {
  const supabaseClient = createSupabaseBrowserClient();
  const { error: signInError } = await supabaseClient.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: emailRedirectTo,
    },
  });

  if (signInError) return { ok: false, error: signInError };
  return { ok: true, value: undefined };
};

const verifyOTP = async (
  email: string,
  token: string,
): Promise<Result<void>> => {
  const supabaseClient = createSupabaseBrowserClient();
  const { error: verifyOTPError } = await supabaseClient.auth.verifyOtp({
    email: email,
    token: token,
    type: "email",
  });

  if (verifyOTPError) return { ok: false, error: verifyOTPError };
  return { ok: true, value: undefined };
};

const signInAnonymously = async (): Promise<Result<void>> => {
  const supabaseClient = createSupabaseBrowserClient();
  const { error: anonymouslySignInError } =
    await supabaseClient.auth.signInAnonymously();

  if (anonymouslySignInError)
    return { ok: false, error: anonymouslySignInError };
  return { ok: true, value: undefined };
};

const convertAnonymousUserToPermanentUser = async (
  email: string,
): Promise<Result<void>> => {
  const supabaseClient = createSupabaseBrowserClient();
  const { error: updateEmailError } = await supabaseClient.auth.updateUser({
    email: email,
  });

  if (updateEmailError) return { ok: false, error: updateEmailError };
  return { ok: true, value: undefined };
};

export {
  signInWithOTP,
  verifyOTP,
  signInAnonymously,
  convertAnonymousUserToPermanentUser,
};
