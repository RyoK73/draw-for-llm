import * as fabric from "fabric";
import { useRef, useState, useEffect, RefObject } from "react";
import { saveToDb } from "@/save-sketch/saveToDb";
import { SketchInfo } from "@/save-sketch/saveToDb.types";

const useSave = (
  fabricCanvasRef: RefObject<fabric.Canvas>,
  sketchIdRef: RefObject<string | undefined>,
) => {
  const [isAutoSave, setAutoSave] = useState(true);
  const sketchInfoRef = useRef<SketchInfo>(null);
  const [err, setErr] = useState<Error>();

  const save = async () => {
    if (sketchInfoRef.current === null) return;
    const saveResult = await saveToDb(
      fabricCanvasRef.current,
      sketchInfoRef.current,
      sketchIdRef.current,
    );

    if (!saveResult.ok) {
      setErr(saveResult.error);
      return;
    }

    sketchIdRef.current = saveResult.value.id;
    setErr(undefined);
  };

  useEffect(() => {
    const handler = () => {
      if (!isAutoSave) return;
      save();
    };
    fabricCanvasRef.current?.on("object:modified", handler);

    return () => {
      fabricCanvasRef.current.off("object:modified", handler);
    };
  }, [sketchInfoRef, fabricCanvasRef, isAutoSave]);

  return { isAutoSave, setAutoSave, sketchInfoRef, err, save };
};

export { useSave };
