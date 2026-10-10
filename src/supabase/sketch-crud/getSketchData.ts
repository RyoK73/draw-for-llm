import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";
import { GetSketchData } from "@/supabase/sketch-crud/getSketchData.types";
import { Result } from "@/utils/utility.types";

// Get the sketch list in descending order of updated_at. It does not select canvas_json.
const getSketchData = async (
  supabaseClient: SupabaseClient,
): Promise<Result<GetSketchData>> => {
  const { data, error } = await supabaseClient
    .from("sketches")
    .select("id,title,description,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return { ok: false, error: error };
  }
  return { ok: true, value: data };
};

export { getSketchData };
