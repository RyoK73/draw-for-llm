import { Database, type Json } from "@/supabase/database.types";
import { type PostgrestError } from "@supabase/supabase-js";
import { Result } from "@/supabase/handleDb.types";
import createClientComponentClient from "@/supabase/supabaseClient";
import pkg from "@/../package.json";

const getFabricVersion = (): string => pkg.dependencies.fabric;

// Set the json data to sketch table.
type SetSketchResult = {
  data:
    Database["public"]["Tables"]["sketches"]["Insert"]["canvas_json"][] | null;
  error: PostgrestError | null;
};

const setSketchJsons = async (
  sketches: Json[],
): Promise<Result<SetSketchResult["data"], SetSketchResult["error"]>> => {
  const supabaseClient = createClientComponentClient();
  const { data, error }: SetSketchResult = await supabaseClient
    .from("sketches")
    .insert(sketches)
    .select();

  if (error) {
    return { ok: false, error: error };
  }
  return { ok: true, value: data };
};

export { getFabricVersion, setSketchJsons };
