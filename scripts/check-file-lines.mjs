import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MAX_LINES = 300;
const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".prisma",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml",
]);
const EXCLUDED_DIRS = new Set([
  ".git",
  ".next",
  "backups",
  "coverage",
  "dist",
  "node_modules",
]);
const EXCLUDED_FILES = new Set([
  "next-env.d.ts",
  "package-lock.json",
  "pnpm-lock.yaml",
  "tsconfig.tsbuildinfo",
  "yarn.lock",
]);

const tooLong = [];

await walk(ROOT);

if (tooLong.length > 0) {
  console.error(`Files over ${MAX_LINES} lines:`);
  for (const item of tooLong.sort((left, right) => right.lines - left.lines)) {
    console.error(`${String(item.lines).padStart(4, " ")} ${item.file}`);
  }
  process.exit(1);
}

console.log(`OK: checked source/docs files, all <= ${MAX_LINES} lines.`);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(ROOT, fullPath);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) {
        continue;
      }
      await walk(fullPath);
      continue;
    }

    if (!entry.isFile() || shouldSkipFile(entry.name, relativePath)) {
      continue;
    }

    const content = await readFile(fullPath, "utf8");
    const lines = content.length === 0 ? 0 : content.split("\n").length;

    if (lines > MAX_LINES) {
      tooLong.push({ file: relativePath, lines });
    }
  }
}

function shouldSkipFile(fileName, relativePath) {
  if (EXCLUDED_FILES.has(fileName)) {
    return true;
  }
  if (relativePath.includes(`${path.sep}backups${path.sep}`)) {
    return true;
  }
  return !TEXT_EXTENSIONS.has(path.extname(fileName));
}
