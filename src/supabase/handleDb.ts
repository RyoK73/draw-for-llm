import { Database, type Json } from "@/supabase/database.types";
import { PostgrestError } from "@supabase/supabase-js";
import { Result } from "@/supabase/handleDb.types";
import createClientComponentClient from "@/supabase/supabaseClient";
import pkg from "@/../package.json";

const getFabricVersion = (): string => pkg.dependencies.fabric;

// Get the json data from sketch table.
type GetSketchResult = {
  data: Database["public"]["Tables"]["sketches"]["Row"]["canvas_json"];
  error: PostgrestError;
};

const getSketchJson = async (
  id: string,
): Promise<Result<GetSketchResult["data"], GetSketchResult["error"]>> => {
  const supabaseClient = createClientComponentClient();
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

// Insert the json data to sketch table.
type insertSketchResult = {
  data: Database["public"]["Tables"]["sketches"]["Insert"];
  error: Error;
};

const insertSketch = async (
  sketch: insertSketchResult["data"],
): Promise<Result<insertSketchResult["data"], insertSketchResult["error"]>> => {
  const supabaseClient = createClientComponentClient();
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

export { getFabricVersion, getSketchJson, insertSketch };
