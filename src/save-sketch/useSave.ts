import * as fabric from "fabric";
import { useRef, useState, useEffect } from "react";

const useSave = async () => {
  const [isAutoSave, setAutoSave] = useState(true);
  const fabricCanvasRef = useRef<fabric.Canvas>(null);

  const save = async () => {};

  useEffect(() => {
    fabricCanvasRef.current?.on("object:modified", () => {
      if (!isAutoSave) return;

      save();
    });
  });

  return { isAutoSave, setAutoSave, fabricCanvasRef };
};

export { useSave };
