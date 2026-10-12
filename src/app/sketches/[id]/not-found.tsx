import Link from "next/link";

const notFound = () => {
  return (
    <div className="flex flex-col gap-2">
      <p>スケッチが見つかりません。</p>
      <Link href="/sketches" className="underline">
        スケッチ一覧へ戻る
      </Link>
    </div>
  );
};

export default notFound;
