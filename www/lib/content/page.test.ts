import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadProjectPage } from "@/lib/content/load";

const CONTENT = path.resolve(import.meta.dirname, "..", "..", "..", "content");

describe("loadProjectPage (소개 페이지 v2)", () => {
  it("CallGuard 시범 원고가 스키마를 통과한다", () => {
    const page = loadProjectPage(CONTENT, "callguard", []);
    expect(page?.features.filter((f) => f.core).length).toBeGreaterThan(0);
    expect(page?.troubles.length).toBeGreaterThanOrEqual(2);
  });

  it("채용 담당자가 찾는 항목(역할 한 줄, 코드 근거, 협업, AI 도구, 배운 점)이 들어 있다", () => {
    const page = loadProjectPage(CONTENT, "callguard", []);
    expect(page?.overview.role).toBeTruthy();
    expect(page?.troubles.some((t) => t.evidence.length > 0)).toBe(true);
    expect(page?.role.collab.length).toBeGreaterThan(0);
    expect(page?.role.ai.length).toBeGreaterThan(0);
    expect(page?.retro.learned.length).toBeGreaterThan(0);
  });

  it("page.yaml이 없는 프로젝트는 null", () => {
    expect(loadProjectPage(CONTENT, "jbconnect", [])).toBeNull();
  });

  it("금지어가 있으면 실패한다", () => {
    expect(() => loadProjectPage(CONTENT, "callguard", ["다산콜센터"])).toThrowError(/공개 금지/);
  });
});

describe("기능 화면", () => {
  it("모든 기능에 화면이 있어야 한다 — 이미지 없는 기능은 실패", async () => {
    const fs = await import("node:fs");
    const os = await import("node:os");
    const { stringify, parse } = await import("yaml");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "page-"));
    fs.mkdirSync(path.join(tmp, "callguard", "media"), { recursive: true });
    const page = parse(fs.readFileSync(path.join(CONTENT, "callguard", "page.yaml"), "utf8"));
    for (const f of [...page.features.map((x: { image?: string }) => x.image), page.architecture.image])
      if (f) fs.writeFileSync(path.join(tmp, "callguard", f), "");
    delete page.features[0].image;
    fs.writeFileSync(path.join(tmp, "callguard", "page.yaml"), stringify(page));
    expect(() => loadProjectPage(tmp, "callguard", [])).toThrowError(/features\.0\.image/);
  });
});
