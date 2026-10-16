import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { getSketch } from "@/supabase/sketch-crud/getSketch";
import { LocalTime } from "@/design-system/local-time";
import { SketchCanvas } from "@/sketch-detail/sketch-canvas";

const SketchDetail = async ({ id }: { id: string }) => {
  if (!z.uuid().safeParse(id).success) notFound();

  const supabaseClient = await createSupabaseServerClient();
  const result = await getSketch(supabaseClient, id);

  if (!result.ok) {
    return (
      <>
        <p role="alert">スケッチの取得に失敗しました。</p>
        <Link href="/sketches" className="underline">
          スケッチ一覧へ戻る
        </Link>
      </>
    );
  }

  const sketch = result.value;
  if (!sketch) notFound();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold">{sketch.title}</h1>
      {sketch.description && (
        <p className="text-zinc-600 dark:text-zinc-400">{sketch.description}</p>
      )}
      <p>
        {sketch.width} × {sketch.height}
      </p>
      {sketch.updated_at ? <LocalTime updatedAt={sketch.updated_at} /> : null}
      <SketchCanvas sketch={sketch} />
    </div>
  );
};

export { SketchDetail };
