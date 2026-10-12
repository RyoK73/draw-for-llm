import { SketchList } from "@/sketch-list";
import { NewSketchButton } from "@/new-sketch";

const page = () => {
  return (
    <div>
      <h1>sketches</h1>
      <NewSketchButton />
      <SketchList />
    </div>
  );
};

export default page;
