import z from "zod";

const remoteEnvSchema = z.object({
  PROJECTID: z.string().min(1),
  SUPABASE_ACCESS_TOKEN: z.string().min(1),
});

const authConfigSchema = z.object({
  external_anonymous_users_enabled: z.boolean(),
});

export { remoteEnvSchema, authConfigSchema };
