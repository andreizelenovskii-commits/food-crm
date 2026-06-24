import { tailLog } from "./local-process-manager.mjs";

function getLines() {
  const raw = process.argv.find((arg) => arg.startsWith("--lines="))?.split("=")[1];
  const value = Number(raw ?? 100);
  return Number.isInteger(value) && value > 0 ? value : 100;
}

async function print(name, lines) {
  const output = await tailLog(name, lines);
  console.log(`\n== ${name.toUpperCase()} ==`);
  console.log(output || "(no log yet)");
}

async function main() {
  const lines = getLines();
  const backendOnly = process.argv.includes("--backend");
  const frontendOnly = process.argv.includes("--frontend");

  if (backendOnly) {
    await print("backend", lines);
    return;
  }

  if (frontendOnly) {
    await print("frontend", lines);
    return;
  }

  await print("backend", lines);
  await print("frontend", lines);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
