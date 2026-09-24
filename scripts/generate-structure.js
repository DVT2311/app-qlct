#!/usr/bin/env node
// Sinh phần cây thư mục trong docs/STRUCTURE.md. Chạy bằng `pnpm docs:structure`.
// Chỉ ghi đè đoạn giữa hai marker, phần chữ giải thích viết tay giữ nguyên.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, "docs", "STRUCTURE.md");
const START_MARKER = "<!-- STRUCTURE:AUTO:START -->";
const END_MARKER = "<!-- STRUCTURE:AUTO:END -->";

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".expo",
  ".turbo",
  ".vscode",
  ".claude",
  "dist",
  "build",
  "out",
  "coverage",
  "android",
  "ios",
  ".pnpm-store",
  ".branches", // trạng thái runtime tạm của Supabase CLI, không phải mã nguồn
  ".temp",
]);
const IGNORE_FILES = new Set([".DS_Store"]);
const MAX_ENTRIES_PER_DIR = 12;

function listEntries(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => !IGNORE_DIRS.has(e.name) && !IGNORE_FILES.has(e.name))
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

function buildTree(dir, prefix) {
  const entries = listEntries(dir);
  const shown = entries.slice(0, MAX_ENTRIES_PER_DIR);
  const truncatedCount = entries.length - shown.length;
  const lines = [];

  shown.forEach((entry, i) => {
    const isLastVisible = i === shown.length - 1 && truncatedCount === 0;
    const connector = isLastVisible ? "└── " : "├── ";
    const childPrefix = prefix + (isLastVisible ? "    " : "│   ");
    if (entry.isDirectory()) {
      lines.push(`${prefix}${connector}${entry.name}/`);
      lines.push(...buildTree(path.join(dir, entry.name), childPrefix));
    } else {
      lines.push(`${prefix}${connector}${entry.name}`);
    }
  });

  if (truncatedCount > 0) {
    lines.push(`${prefix}└── … (+${truncatedCount} mục khác)`);
  }

  return lines;
}

const tree = [`${path.basename(ROOT)}/`, ...buildTree(ROOT, "")].join("\n");

const generatedAt = new Date().toISOString();
const block = [
  START_MARKER,
  "```",
  tree,
  "```",
  "",
  `_Sinh tự động lúc ${generatedAt} bởi \`pnpm docs:structure\`. Không sửa tay đoạn này — sửa xong sẽ bị ghi đè ở lần chạy kế tiếp._`,
  END_MARKER,
].join("\n");

const existing = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf8") : "";
const startIdx = existing.indexOf(START_MARKER);
const endIdx = existing.indexOf(END_MARKER);

let next;
if (startIdx !== -1 && endIdx !== -1) {
  next = existing.slice(0, startIdx) + block + existing.slice(endIdx + END_MARKER.length);
} else {
  next = existing + (existing.endsWith("\n") || existing === "" ? "" : "\n") + "\n" + block + "\n";
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, next);
console.log("Đã cập nhật docs/STRUCTURE.md");
