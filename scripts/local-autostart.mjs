import { existsSync, readFileSync, rmSync, writeFileSync, chmodSync } from "node:fs";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureLocalDirs, frontendDir, localLogsDir, run } from "./local-utils.mjs";

const label = "ru.crmandromeda.foodlike.local";
const plistPath = resolve(homedir(), "Library", "LaunchAgents", `${label}.plist`);
const runnerPath = resolve(frontendDir, ".local", "foodlike-local-autostart.sh");

async function which(command) {
  let output = "";
  await new Promise((resolvePromise, reject) => {
    const child = spawn("which", [command], { stdio: ["ignore", "pipe", "ignore"] });
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolvePromise() : reject(new Error(`${command} not found`)));
  });
  return output.trim();
}

async function writeRunner() {
  ensureLocalDirs();
  const npmBin = await which("npm");
  const template = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "local-autostart-runner.sh.template"), "utf8");
  writeFileSync(
    runnerPath,
    template
      .replaceAll("__FRONTEND_DIR__", frontendDir)
      .replaceAll("__NPM_BIN__", npmBin),
  );
  chmodSync(runnerPath, 0o755);
}

function writePlist() {
  const autostartLog = resolve(localLogsDir, "autostart.log");
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${runnerPath}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${autostartLog}</string>
  <key>StandardErrorPath</key>
  <string>${autostartLog}</string>
</dict>
</plist>
`;
  writeFileSync(plistPath, plist);
}

async function install() {
  await writeRunner();
  writePlist();
  await run("launchctl", ["bootout", `gui/${process.getuid()}`, plistPath], { stdio: "ignore" }).catch(() => undefined);
  await run("launchctl", ["bootstrap", `gui/${process.getuid()}`, plistPath]);
  console.log(`Installed LaunchAgent: ${plistPath}`);
}

async function uninstall() {
  await run("launchctl", ["bootout", `gui/${process.getuid()}`, plistPath], { stdio: "ignore" }).catch(() => undefined);
  rmSync(plistPath, { force: true });
  rmSync(runnerPath, { force: true });
  console.log("Removed FoodLike local LaunchAgent. Local DB/env/backups were kept.");
}

async function status() {
  console.log(`Installed: ${existsSync(plistPath) ? "YES" : "NO"}`);
  if (existsSync(plistPath)) {
    await run("launchctl", ["print", `gui/${process.getuid()}/${label}`]).catch(() => {
      console.log("Loaded: NO");
    });
  }
  await run("node", ["scripts/local-status.mjs"]).catch(() => undefined);
}

const action = process.argv[2];
if (action === "install") {
  install().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
} else if (action === "uninstall") {
  uninstall().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
} else if (action === "status") {
  status().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
} else {
  console.error("Usage: node scripts/local-autostart.mjs install|uninstall|status");
  process.exit(1);
}
