import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";
import { GetSketch } from "@/supabase/sketch-crud/getSketch.types";
import { Result } from "@/utils/utility.types";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

// Get a sketch by id, with the columns to restore the canvas (canvas_json, cell_size, frame_id, fabric_version).
// It returns null when no row is visible (the id does not exist or belongs to another user).
const getSketch = async (
  supabaseClient: SupabaseClient<DatabaseModified>,
  id: string,
): Promise<Result<GetSketch | null>> => {
  const { data, error } = await supabaseClient
    .from("sketches")
    .select(
      "id,title,description,width,height,created_at,updated_at,canvas_json,cell_size,frame_id,fabric_version",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error };
  }
  return { ok: true, value: data };
};

export { getSketch };
