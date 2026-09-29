import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findBannedTerms, readBannedTerms } from "@/lib/content/banned";

describe("findBannedTerms", () => {
  it("깨끗한 텍스트는 빈 배열", () => {
    expect(findBannedTerms("헥사고날 아키텍처로 설계했다", [])).toEqual([]);
  });

  it("Google API 키 패턴을 잡는다", () => {
    const key = "AIza" + "a".repeat(35);
    expect(findBannedTerms(`key: ${key}`, [])).toContain("Google API 키");
  });

  it("사설 IP를 잡는다", () => {
    expect(findBannedTerms("서버 192.168.0.10 에 배포", [])).toContain("사설 IP");
    expect(findBannedTerms("10.0.0.5", [])).toContain("사설 IP");
  });

  it("금지어는 원문 대신 순번으로 보고한다", () => {
    const hits = findBannedTerms("팀원 홍길동이 담당", ["김철수", "홍길동"]);
    expect(hits).toEqual(["금지어 #2"]);
    expect(hits.join()).not.toContain("홍길동");
  });
});

describe("readBannedTerms", () => {
  const saved = process.env.BANNED_TERMS;
  afterEach(() => {
    process.env.BANNED_TERMS = saved;
  });

  it("환경변수(줄바꿈·쉼표)와 로컬 파일을 합친다", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "banned-"));
    fs.writeFileSync(path.join(dir, ".banned.local.txt"), "갑\n\n을\n");
    process.env.BANNED_TERMS = "병, 정\n무";
    expect(readBannedTerms(dir).sort()).toEqual(["갑", "무", "병", "을", "정"].sort());
  });

  it("둘 다 없으면 빈 배열", () => {
    delete process.env.BANNED_TERMS;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "banned-"));
    expect(readBannedTerms(dir)).toEqual([]);
  });
});
