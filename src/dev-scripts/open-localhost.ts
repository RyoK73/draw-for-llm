// Why is this script needed? To open the localhost link automatically.
import { spawn } from "node:child_process";
import open from "open";
import { consola } from "consola";

const child = spawn("next", ["dev"], { stdio: ["inherit", "pipe", "inherit"] });
let opened = false;
child.stdout.on("data", (data: Buffer) => {
  const text = data.toString();
  process.stdout.write(text);

  // This checks whether the log contains the string "Ready" to determine true/false.
  // It may break if that log message changes in a future update.
  if (!opened && text.includes("Ready")) {
    opened = true;
    open("http://localhost:3000").catch((err) =>
      consola.error(`localhost:3000が開けませんでした。\n${err}`),
    );
  }
});

child.on("error", (err) => {
  consola.error(err);
  process.exit(1);
});

child.on("exit", (code) => {
  consola.success("Process closed successfully");
  process.exit(code ?? 0);
});
