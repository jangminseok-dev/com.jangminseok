// content/<slug>/media → www/public/media/<slug> 로 복사한다. predev·prebuild에서 실행.
import fs from "node:fs";
import path from "node:path";

const wwwDir = path.resolve(import.meta.dirname, "..");
const contentDir = path.resolve(wwwDir, "..", "content");
const outDir = path.join(wwwDir, "public", "media");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

if (fs.existsSync(contentDir)) {
  for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const src = path.join(contentDir, entry.name, "media");
    if (!fs.existsSync(src)) continue;
    fs.cpSync(src, path.join(outDir, entry.name), { recursive: true });
  }
}
