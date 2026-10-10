import Link from "next/link";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { getSketchData } from "@/supabase/sketch-crud/getSketchData";
import { LocalTime } from "@/sketch-list/local-time";

const SketchList = async () => {
  const supabaseClient = await createSupabaseServerClient();
  const result = await getSketchData(supabaseClient);

  if (!result.ok) {
    return <p role="alert">スケッチ一覧の取得に失敗しました。</p>;
  }

  if (result.value.length === 0) {
    return <p>スケッチがまだありません。</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {result.value.map((sketch) => (
        <li key={sketch.id}>
          <Link
            href={`/sketches/${sketch.id}`}
            className="flex flex-col gap-1 rounded border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            <span className="font-semibold">{sketch.title}</span>
            {sketch.description && (
              <span className="text-zinc-600 dark:text-zinc-400">
                {sketch.description}
              </span>
            )}
            {sketch.updated_at ? (
              <LocalTime updatedAt={sketch.updated_at} />
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export { SketchList };
