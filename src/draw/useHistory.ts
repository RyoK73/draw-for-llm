import { useState } from "react";

type History = {
  future: any[];
  present: any;
  past: any[];
};

const useHistory = () => {
  const [history, setHistory] = useState<History>({
    future: [],
    present: "",
    past: [],
  });
  const redo = () => {
    setHistory((prev) => {
      const futureValue = prev.future.pop();
      return {
        future: [...prev.future],
        present: futureValue,
        past: [...prev.past, futureValue],
      };
    });
  };

  const set = (newObject: any) => {
    setHistory((prev) => ({
      future: [],
      present: newObject,
      past: [...prev.past, newObject],
    }));
  };

  const undo = () => {
    setHistory((prev) => {
      if (prev.past.length < 2) return prev;
      const previousValue = prev.past.at(-2);
      prev.past.splice(prev.past.length - 1, 1);
      return {
        future: [...prev.future, prev.present],
        present: previousValue,
        past: [...prev.past],
      };
    });
  };

  return { history, set, undo, redo };
};

export { useHistory };
