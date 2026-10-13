import { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/utils/utility.types";
import { updateUser } from "@/supabase/auth/utility";

const signInWithOTP = async (
  supabaseClient: SupabaseClient,
  email: string,
  emailRedirectTo: string,
): Promise<Result<void>> => {
  const { error: signInError } = await supabaseClient.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: emailRedirectTo,
    },
  });

  if (signInError) return { ok: false, error: signInError };
  return { ok: true, value: undefined };
};

const verifyOTP = async (
  supabaseClient: SupabaseClient,
  email: string,
  token: string,
): Promise<Result<void>> => {
  const { error: verifyOTPError } = await supabaseClient.auth.verifyOtp({
    email: email,
    token: token,
    type: "email",
  });

  if (verifyOTPError) return { ok: false, error: verifyOTPError };
  return { ok: true, value: undefined };
};

const signInAnonymously = async (
  supabaseClient: SupabaseClient,
): Promise<Result<void>> => {
  const { error: anonymouslySignInError } =
    await supabaseClient.auth.signInAnonymously();

  if (anonymouslySignInError)
    return { ok: false, error: anonymouslySignInError };
  return { ok: true, value: undefined };
};

const convertAnonymousUserToPermanentUser = async (
  supabaseClient: SupabaseClient,
  email: string,
): Promise<Result<void>> => {
  return await updateUser(supabaseClient, email);
};

export {
  signInWithOTP,
  verifyOTP,
  signInAnonymously,
  convertAnonymousUserToPermanentUser,
};
