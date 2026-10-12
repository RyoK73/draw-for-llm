import { SketchDetail } from "@/sketch-detail";

const page = async ({ params }: PageProps<"/sketches/[id]">) => {
  const { id } = await params;
  return <SketchDetail id={id} />;
};

export default page;
