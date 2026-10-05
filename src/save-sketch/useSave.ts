import * as fabric from "fabric";
import { useRef, useState, useEffect, RefObject } from "react";
import { saveToDb } from "@/save-sketch/saveToDb";
import { SketchInfo, CanvasFrame } from "@/save-sketch/saveToDb.types";
import pDebounce from "p-debounce";

const SAVE_DELAY: number = 250;

const useSave = (
  fabricCanvasRef: RefObject<fabric.Canvas>,
  sketchIdRef: RefObject<string | undefined>,
  frameRef: RefObject<CanvasFrame | null>,
) => {
  const [isAutoSave, setAutoSave] = useState(true);
  const sketchInfoRef = useRef<SketchInfo>(null);
  const [err, setErr] = useState<Error>();
  const debounceSaveToDb = pDebounce(saveToDb, SAVE_DELAY);

  const save = async () => {
    if (sketchInfoRef.current === null) {
      setErr(new Error("Error: sketchInfoRef is null."));
      return;
    }
    if (frameRef.current === null) {
      setErr(new Error("Error: frameRef is null."));
      return;
    }
    const saveResult = await debounceSaveToDb(
      fabricCanvasRef.current,
      sketchInfoRef.current,
      frameRef.current,
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
    fabricCanvasRef.current.on("object:modified", handler);

    return () => {
      fabricCanvasRef.current.off("object:modified", handler);
    };
  }, [sketchInfoRef, fabricCanvasRef, isAutoSave]);

  return { isAutoSave, setAutoSave, sketchInfoRef, err, save };
};

export { useSave };
