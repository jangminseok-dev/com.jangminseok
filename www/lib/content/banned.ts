import fs from "node:fs";
import path from "node:path";

const SECRET_PATTERNS: readonly { name: string; re: RegExp }[] = [
  { name: "Google API 키", re: /AIza[0-9A-Za-z_-]{35}/ },
  { name: "LLM API 키", re: /\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}/ },
  { name: "사설 IP", re: /\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/ },
];

const LOCAL_FILE = ".banned.local.txt";

// 걸린 항목의 "이름"만 돌려준다 — 금지어 원문은 CI 로그에 남기지 않는다.
export function findBannedTerms(text: string, terms: readonly string[]): string[] {
  const hits = SECRET_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.name);
  terms.forEach((term, i) => {
    if (text.includes(term)) hits.push(`금지어 #${i + 1}`);
  });
  return hits;
}

export function readBannedTerms(contentDir: string): string[] {
  const fromEnv = (process.env.BANNED_TERMS ?? "").split(/[\n,]/);
  const file = path.join(contentDir, LOCAL_FILE);
  const fromFile = fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n") : [];
  return [...fromEnv, ...fromFile].map((t) => t.trim()).filter(Boolean);
}
