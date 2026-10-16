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
  | "canvas_json"
  | "cell_size"
  | "frame_id"
  | "fabric_version"
>;

export type { GetSketch };
