import { spawn } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ensureLocalDirs,
  frontendDir,
  findBackendDir,
  localLocksDir,
  localLogsDir,
  localPidsDir,
  run,
  sleep,
} from "./local-utils.mjs";

export const services = {
  backend: {
    port: 4000,
    healthUrl: "http://127.0.0.1:4000/api/v1/health",
    command: "npm",
    args: ["run", "dev"],
    cwd: () => findBackendDir(),
    env: { NODE_ENV: "development", LOCAL_DEV_TOOLS_ENABLED: "true" },
  },
  frontend: {
    port: 3000,
    healthUrl: "http://localhost:3000/api/health",
    command: "npm",
    args: ["run", "dev"],
    cwd: () => frontendDir,
    env: {},
  },
};

export function pidPath(name) {
  ensureLocalDirs();
  return resolve(localPidsDir, `${name}.pid`);
}

export function logPath(name) {
  ensureLocalDirs();
  return resolve(localLogsDir, `${name}.log`);
}

function readPid(name) {
  const path = pidPath(name);
  if (!existsSync(path)) return null;
  const pid = Number(readFileSync(path, "utf8").trim());
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}

export function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function getCommandForPid(pid) {
  try {
    let output = "";
    const child = spawn("ps", ["-p", String(pid), "-o", "command="], { stdio: ["ignore", "pipe", "ignore"] });
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    await new Promise((resolvePromise) => child.on("exit", resolvePromise));
    return output.trim();
  } catch {
    return "";
  }
}

export async function serviceStatus(name) {
  const pid = readPid(name);
  if (!pid) {
    return { name, status: "STOPPED", pid: null, command: "" };
  }

  if (!isPidAlive(pid)) {
    // Recover stale PID files left after terminal crashes or forced quits.
    rmSync(pidPath(name), { force: true });
    return { name, status: "STOPPED", pid: null, command: "" };
  }

  return {
    name,
    status: "RUNNING",
    pid,
    command: await getCommandForPid(pid),
  };
}

export async function getPortOwner(port) {
  try {
    let output = "";
    const child = spawn("lsof", ["-nP", "-iTCP:" + port, "-sTCP:LISTEN", "-Fp", "-Fc"], {
      stdio: ["ignore", "pipe", "ignore"],
    });
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    await new Promise((resolvePromise) => child.on("exit", resolvePromise));
    const pid = output.split(/\r?\n/).find((line) => line.startsWith("p"))?.slice(1);
    const command = output.split(/\r?\n/).find((line) => line.startsWith("c"))?.slice(1);
    return pid ? { pid: Number(pid), command: command ?? "" } : null;
  } catch {
    return null;
  }
}

export async function checkServiceHealth(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function startService(name) {
  const config = services[name];
  const current = await serviceStatus(name);
  if (current.status === "RUNNING") {
    return { started: false, pid: current.pid };
  }

  const owner = await getPortOwner(config.port);
  if (owner) {
    throw new Error(
      `${name} port ${config.port} is already used by PID ${owner.pid}${owner.command ? ` (${owner.command})` : ""}. Stop it manually, then retry.`,
    );
  }

  const out = openSync(logPath(name), "a");
  const err = openSync(logPath(name), "a");
  const child = spawn(config.command, config.args, {
    cwd: config.cwd(),
    env: { ...process.env, ...config.env },
    detached: true,
    stdio: ["ignore", out, err],
    shell: false,
  });
  child.unref();
  closeSync(out);
  closeSync(err);
  writeFileSync(pidPath(name), `${child.pid}\n`);
  return { started: true, pid: child.pid };
}

export async function stopService(name) {
  const current = await serviceStatus(name);
  if (current.status !== "RUNNING" || !current.pid) {
    return { stopped: false };
  }

  process.kill(current.pid, "SIGTERM");
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (!isPidAlive(current.pid)) {
      rmSync(pidPath(name), { force: true });
      return { stopped: true };
    }
    await sleep(250);
  }

  process.kill(current.pid, "SIGKILL");
  rmSync(pidPath(name), { force: true });
  return { stopped: true, killed: true };
}

export async function stopApps() {
  await stopService("frontend");
  await stopService("backend");
}

export async function withStartLock(fn) {
  ensureLocalDirs();
  const lockPath = resolve(localLocksDir, "start.lock");
  let fd;
  try {
    fd = openSync(lockPath, "wx");
    writeFileSync(fd, `${process.pid}\n`);
  } catch {
    throw new Error("local:start is already running. Wait for it to finish, then retry.");
  }

  try {
    return await fn();
  } finally {
    if (fd) closeSync(fd);
    rmSync(lockPath, { force: true });
  }
}

export async function tailLog(name, lines = 100) {
  const file = logPath(name);
  if (!existsSync(file)) {
    return "";
  }

  let output = "";
  await new Promise((resolvePromise) => {
    const child = spawn("tail", ["-n", String(lines), file], { stdio: ["ignore", "pipe", "ignore"] });
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.on("exit", resolvePromise);
  });
  return output;
}

export async function stopPostgres() {
  await run("docker", ["compose", "stop", "postgres"]);
}
