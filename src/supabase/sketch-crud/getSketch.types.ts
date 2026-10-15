import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

type GetSketch = Pick<
  DatabaseModified["public"]["Tables"]["sketches"]["Row"],
  | "id"
  | "title"
  | "description"
  | "width"
  | "height"
  | "created_at"
  | "updated_at"
>;

export type { GetSketch };
