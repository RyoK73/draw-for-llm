import { setTimeout } from "timers/promises";
import consola from "consola";

const clsr = () => {
  let num: number = 0;
  num = num++;
  return num;
};
const func = async () => {
  for (let i: number = 1; i <= 5; i++) {
    console.log(clsr());
  }
};

func();
