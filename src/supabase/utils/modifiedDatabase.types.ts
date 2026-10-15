import { Database as DatabaseGenerated } from "@/supabase/utils/database.types";
import { MergeDeep } from "type-fest";

type FabricJSON = string | Record<string, unknown>;

type DatabaseModified = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        sketches: {
          Row: {
            canvas_json: FabricJSON;
          };
          Insert: {
            canvas_json?: FabricJSON;
          };
          Update: {
            canvas_json?: FabricJSON;
          };
        };
      };
    };
  }
>;

export type { FabricJSON, DatabaseModified };
