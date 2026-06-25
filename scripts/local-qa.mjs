import { findBackendDir, run } from "./local-utils.mjs";

const results = [];

async function check(label, fn, required = true) {
  try {
    await fn();
    results.push([label, "PASS"]);
    return true;
  } catch (error) {
    const code = error && typeof error === "object" && "message" in error ? error.message : String(error);
    results.push([label, required ? "FAIL" : "SKIPPED", code]);
    if (required) {
      return false;
    }
    return true;
  }
}

function printSummary() {
  console.log("");
  console.log("CHECK".padEnd(32) + "RESULT");
  for (const [label, result, detail] of results) {
    console.log(`${label.padEnd(32)}${result}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  const backendDir = findBackendDir();
  const fast = process.argv.includes("--fast");
  const noE2e = fast || process.argv.includes("--no-e2e");
  let ok = true;

  ok = await check("Docker / Local env", () => run("node", ["scripts/local-doctor.mjs"])) && ok;
  ok = await check("Backend typecheck", () => run("npm", ["run", "typecheck"], { cwd: backendDir })) && ok;
  if (!fast) {
    ok = await check("Backend tests", () => run("npm", ["test"], { cwd: backendDir })) && ok;
  }
  ok = await check("Frontend lint", () => run("npm", ["run", "lint"])) && ok;
  ok = await check("Frontend tests", () => run("npm", ["test"])) && ok;
  if (!fast) {
    ok = await check("Frontend build", () => run("npm", ["run", "build"])) && ok;
  }
  ok = await check("Local auth", () => run("node", ["scripts/local-auth-check.mjs"])) && ok;
  ok = await check("Shift API smoke", () => run("node", ["scripts/local-shift-check.mjs"])) && ok;
  if (!noE2e) {
    const e2eOk = await check("Shift browser E2E", () => run("node", ["scripts/local-shift-e2e.mjs"]), false);
    ok = e2eOk && ok;
  } else {
    results.push(["Shift browser E2E", "SKIPPED", "--fast/--no-e2e"]);
  }

  printSummary();
  if (!ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
