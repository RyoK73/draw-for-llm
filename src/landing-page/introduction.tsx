const Introduction = () => {
  return (
    <>
      <section className="mx-auto flex max-w-2xl flex-col gap-16 px-6 py-24">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight">
            ひらめきを、描いて、渡す
          </h1>
          <p className="max-w-md text-muted-foreground">
            Like-soは、思いついたアイデアをその場でスケッチして、そのままLLMに渡せるキャンバスです。
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            言葉のほかに、もうひとつの伝え方を
          </h2>
          <p className="leading-relaxed">
            自然言語は、人とLLMをつなぐ心強い共通言語です。
          </p>
          <p className="leading-relaxed">
            そのうえで、イメージや感覚のような主観的なものには、絵のほうがまっすぐ届く場面があります。
          </p>
          <p className="leading-relaxed">
            「左にサイドバーがあって、その右にカードが並んでいて……」と書くかわりに、3秒でさっとスケッチする。
            そのほうが速くて、イメージにも近づきます。
          </p>
          <p>
            Like-soは、ひらめきから伝わるまでの時間を、限りなくゼロに近づけます。
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            シンプルで、速い。
          </h2>
          <p className="leading-relaxed">
            Like-soは、軽やかさと速さを大切にしています。
            ひらめいた瞬間に開いて、描いて、渡す。
            その流れだけを、いつでも気持ちよく使えるように磨いていきます。
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            こんな場面で使えます
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            <li className="rounded-xl border p-4">
              <p className="font-medium">LLMへの指示に</p>
              <p className="mt-1 text-sm text-muted-foreground">
                アプリの画面をさっとスケッチして、そのままLLMに渡せます。
              </p>
            </li>
            <li className="rounded-xl border p-4">
              <p className="font-medium">資料や発表に</p>
              <p className="mt-1 text-sm text-muted-foreground">
                描いたモックを画像にして、資料やプレゼンにすぐ載せられます。
              </p>
            </li>
            <li className="rounded-xl border p-4">
              <p className="font-medium">イメージの共有に</p>
              <p className="mt-1 text-sm text-muted-foreground">
                頭の中のイメージを、チームや友人にそのまま見せられます。
              </p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
};

export { Introduction };
