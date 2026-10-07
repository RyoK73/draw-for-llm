import {
  remoteEnvSchema,
  authConfigSchema,
} from "@/supabase/auth/anonymousSignIn.remote.types";
import consola from "consola";

describe("Anonymous sign-in on the remote DB", () => {
  test("external_anonymous_users_enabled should be true", async () => {
    const env = remoteEnvSchema.parse(process.env);

    const res = await fetch(
      `https://api.supabase.com/v1/projects/${env.PROJECTID}/config/auth`,
      { headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}` } },
    );

    if (!res.ok) consola.error(await res.text());

    expect(res.ok, `status: ${res.status}`).toBe(true);
    const config = authConfigSchema.parse(await res.json());
    expect(config.external_anonymous_users_enabled).toBe(true);
  });
});
