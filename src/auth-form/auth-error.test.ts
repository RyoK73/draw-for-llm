import { toAuthErrorInfo } from "@/auth-form/auth-error";

const errorWithCode = (code: string) =>
  Object.assign(new Error("message from supabase"), { code });

describe("toAuthErrorInfo", () => {
  test("should suggest signing in when the email is already registered", () => {
    const info = toAuthErrorInfo(errorWithCode("email_exists"));

    expect(info.suggestSignIn).toBe(true);
    expect(info.message).toContain("登録済み");
  });

  test.each([
    ["over_email_send_rate_limit", "送信しすぎ"],
    ["otp_expired", "有効期限"],
    ["validation_failed", "形式"],
    ["email_address_invalid", "形式"],
  ])("should convert %s to a Japanese message", (code, expected) => {
    const info = toAuthErrorInfo(errorWithCode(code));

    expect(info.suggestSignIn).toBe(false);
    expect(info.message).toContain(expected);
  });

  test("should return the generic message for an unknown code", () => {
    const info = toAuthErrorInfo(errorWithCode("something_else"));

    expect(info).toEqual({
      message: "処理に失敗しました。時間をおいてもう一度お試しください。",
      suggestSignIn: false,
    });
  });

  test("should return the generic message when the error has no code", () => {
    const info = toAuthErrorInfo(new Error("network"));

    expect(info.message).toContain("処理に失敗しました");
    expect(info.suggestSignIn).toBe(false);
  });
});
