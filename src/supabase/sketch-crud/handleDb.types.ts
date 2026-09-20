import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_SITE_URL: z.string(),
  PROJECTID: z.string(),
});

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export { envSchema, type Result };
