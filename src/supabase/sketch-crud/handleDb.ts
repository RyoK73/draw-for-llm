import {
  Result,
  GetSketchJson,
  InsertSketch,
  GetSketchData,
} from "@/supabase/sketch-crud/handleDb.types";
import { createSupabaseBrowserClient } from "@/supabase/browserClient";

// Get the json data from the sketch table.
const getSketchJson = async (
  id: string,
): Promise<Result<GetSketchJson, Error>> => {
  const supabaseClient = createSupabaseBrowserClient();
  const { data, error } = await supabaseClient
    .from("sketches")
    .select("canvas_json")
    .eq("id", id)
    .single();

  if (error) {
    return { ok: false, error: error };
  }
  return { ok: true, value: data.canvas_json };
};

// Insert the json data to the sketch table.
const insertSketch = async (
  sketch: InsertSketch,
): Promise<Result<InsertSketch, Error>> => {
  const supabaseClient = createSupabaseBrowserClient();
  const { data, error } = await supabaseClient
    .from("sketches")
    .insert(sketch)
    .select();

  if (error) {
    return { ok: false, error: error };
  }
  if (data.length !== 1) {
    return {
      ok: false,
      error: new Error(
        `data array does not have exactly one element. data array has ${data.length} elements`,
      ),
    };
  }
  return { ok: true, value: data[0] };
};

// Get the data from the sketch table to specify the canvas_json.
const getSketchData = async (
  dataLimit: number = 10,
): Promise<Result<GetSketchData, Error>> => {
  const supabaseClient = createSupabaseBrowserClient();
  const { data, error } = await supabaseClient
    .from("sketches")
    .select("id,title,description,created_at")
    .limit(dataLimit);

  if (error) {
    return { ok: false, error: error };
  }
  return { ok: true, value: data };
};

export { getSketchJson, insertSketch, getSketchData };
