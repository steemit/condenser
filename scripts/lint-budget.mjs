// CI lint gate. The legacy lint debt has been fully cleaned up, so the
// budget is zero: any eslint error now fails the gate.
import { execFileSync } from "node:child_process";

const BUDGET = 0;

let output;
try {
  output = execFileSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["eslint", ".", "-f", "json"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
} catch (err) {
  // eslint exits 1 when it finds problems; the JSON is on stdout.
  output = err.stdout?.toString();
  if (!output) throw err;
}

const results = JSON.parse(output);
let errors = 0;
for (const file of results) {
  for (const msg of file.messages) {
    if (msg.severity === 2) errors++;
  }
}

if (errors > BUDGET) {
  console.error(
    `lint budget exceeded: ${errors} errors > budget ${BUDGET}. ` +
      "Fix the new errors or consciously raise the budget."
  );
  process.exit(1);
}
console.log(`lint ok: ${errors} errors <= budget ${BUDGET}`);
