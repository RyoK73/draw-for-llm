import { z } from "zod";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
});

type InsertSketch = DatabaseModified["public"]["Tables"]["sketches"]["Insert"];
type ReturnSketch = DatabaseModified["public"]["Tables"]["sketches"]["Row"];

export type { InsertSketch, ReturnSketch };
export { envSchema };
