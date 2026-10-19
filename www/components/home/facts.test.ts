import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { INCIDENTS } from "@/components/home/TroubleLog";
import { STORIES } from "@/components/home/WorkStyle";

// 메인 구역에 직접 적은 문장의 숫자는 그 프로젝트 원고(page.yaml, notes.md)에 있는 값이어야 한다 — 실측 기록이 있는 수치만 싣는 규칙
const CONTENT = path.resolve(import.meta.dirname, "..", "..", "..", "content");
const source = (slug: string) =>
  ["page.yaml", "notes.md"]
    .map((f) => {
      try {
        return readFileSync(path.join(CONTENT, slug, f), "utf8");
      } catch {
        return "";
      }
    })
    .join("\n");
const numbers = (s: string) => s.match(/\d[\d,.]*\d|\d/g) ?? [];

const cases = [
  ...INCIDENTS.map((it) => ({ slug: it.slug, text: [it.title, it.figure.value, it.figure.label, ...it.steps].join(" ") })),
  ...STORIES.map((s) => ({ slug: s.slug, text: [s.title, ...s.rows.map((r) => r.text)].join(" ") })),
];

describe("메인 트러블슈팅 구역과 학습과 평가 설계 구역의 숫자", () => {
  it.each(cases)("$slug 사례의 숫자는 그 프로젝트 원고에 있다", ({ slug, text }) => {
    const src = source(slug);
    expect(src).not.toBe("\n");
    expect(numbers(text).filter((n) => !src.includes(n))).toEqual([]);
  });
});
