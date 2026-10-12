import { z } from "zod";
import { Database } from "@/supabase/utils/database.types";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
});

type InsertSketch = Database["public"]["Tables"]["sketches"]["Insert"];
type ReturnSketch = Database["public"]["Tables"]["sketches"]["Row"];

export type { InsertSketch, ReturnSketch };
export { envSchema };
