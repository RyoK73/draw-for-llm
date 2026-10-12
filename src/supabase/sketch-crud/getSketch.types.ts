import { Database } from "@/supabase/utils/database.types";

type GetSketch = Pick<
  Database["public"]["Tables"]["sketches"]["Row"],
  | "id"
  | "title"
  | "description"
  | "width"
  | "height"
  | "created_at"
  | "updated_at"
>;

export type { GetSketch };
