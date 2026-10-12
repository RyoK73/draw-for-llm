import {
  InsertSketch,
  ReturnSketch,
} from "@/supabase/sketch-crud/handleDb.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/utils/utility.types";
import { createSupabaseBrowserClient } from "@/supabase/utils/browserClient";

// Insert the json data to the sketch table.
const insertSketch = async (
  sketch: InsertSketch,
): Promise<Result<ReturnSketch>> => {
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

const upsertSketch = async (
  supabaseClient: SupabaseClient,
  sketch: InsertSketch,
): Promise<Result<ReturnSketch>> => {
  const { data, error } = await supabaseClient
    .from("sketches")
    .upsert(sketch)
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

export { insertSketch, upsertSketch };
