import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";
import { GetSketchList } from "@/supabase/sketch-crud/getSketchList.types";
import { Result } from "@/utils/utility.types";
import { DatabaseModified } from "@/supabase/utils/modifiedDatabase.types";

// Get the sketch list in descending order of updated_at. It does not select canvas_json.
const getSketchList = async (
  supabaseClient: SupabaseClient<DatabaseModified>,
): Promise<Result<GetSketchList>> => {
  const { data, error } = await supabaseClient
    .from("sketches")
    .select("id,title,description,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return { ok: false, error: error };
  }
  return { ok: true, value: data };
};

export { getSketchList };
