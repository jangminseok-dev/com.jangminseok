import { describe, expect, it } from "vitest";
import { ProfileSchema, ProjectPageSchema, ProjectSchema } from "@/lib/content/schema";
import { validPageData, validProfileData, validProjectData } from "@/lib/content/fixtures";

describe("ProjectSchema", () => {
  it("최소 유효 데이터를 통과시킨다 (영상 없음 허용)", () => {
    const r = ProjectSchema.safeParse(validProjectData());
    expect(r.success).toBe(true);
  });

  it("주 사용 언어는 1~3개, 정해진 목록에서만", () => {
    expect(ProjectSchema.safeParse(validProjectData({ languages: [] })).success).toBe(false);
    expect(ProjectSchema.safeParse(validProjectData({ languages: ["Python", "TypeScript", "Dart", "Java"] })).success).toBe(false);
    expect(ProjectSchema.safeParse(validProjectData({ languages: ["Cobol"] })).success).toBe(false);
    expect(ProjectSchema.safeParse(validProjectData({ languages: ["Python", "Dart"] })).success).toBe(true);
  });

  it("accent는 #RRGGBB만 허용한다", () => {
    expect(ProjectSchema.safeParse(validProjectData({ accent: "red" })).success).toBe(false);
  });

  it("미디어 경로는 media/ 아래 webp·png·jpg·mp4만 허용한다", () => {
    const bad = validProjectData({ preview: { poster: "../secret.png" } });
    expect(ProjectSchema.safeParse(bad).success).toBe(false);
  });

  it("정의되지 않은 키(오타)는 조용히 버리지 않고 실패한다", () => {
    expect(ProjectSchema.safeParse(validProjectData({ preview: { poster: "media/poster.webp", vidoe: "media/p.mp4" } })).success).toBe(false);
    expect(ProjectSchema.safeParse(validProjectData({ slides: [] })).success).toBe(false); // 옛 슬라이드 원고가 남으면 실패
    expect(ProjectSchema.safeParse(validProjectData({ links: { blgo: "https://example.com" } })).success).toBe(false);
  });

  it("전체 시연 영상(preview.demo)을 선택적으로 받는다", () => {
    const data = validProjectData({ preview: { poster: "media/poster.webp", demo: "media/demo.mp4" } });
    expect(ProjectSchema.safeParse(data).success).toBe(true);
  });

  it("핵심 기술(tags)은 1~3개, 각 20자 이하, 빠지면 실패한다", () => {
    const ok = (tags: unknown) => ProjectSchema.safeParse(validProjectData({ tags })).success;
    expect(ok(["Elasticsearch", "RAG", "개인정보 마스킹"])).toBe(true);
    expect(ok([])).toBe(false);
    expect(ok(["a", "b", "c", "d"])).toBe(false);
    expect(ok(["가".repeat(21)])).toBe(false);
    const { tags: _tags, ...rest } = validProjectData();
    expect(ProjectSchema.safeParse(rest).success).toBe(false);
  });
});

describe("ProjectPageSchema", () => {
  it("최소 유효 데이터를 통과시킨다", () => {
    expect(ProjectPageSchema.safeParse(validPageData()).success).toBe(true);
  });

  it("요건 근거(proves)는 정의된 요건 id, 30자 이하 한 줄, 섹션 번호 01~06만", () => {
    const bad = (p: Record<string, unknown>) => ProjectPageSchema.safeParse(validPageData({ proves: [p] })).success;
    expect(bad({ id: "not-a-requirement", label: "l", anchor: "05" })).toBe(false);
    expect(bad({ id: "rag", label: "가".repeat(31), anchor: "05" })).toBe(false);
    expect(bad({ id: "rag", label: "l", anchor: "07" })).toBe(false);
  });

  it("어려웠던 점은 2~5개다", () => {
    const one = validPageData();
    one.troubles = (one.troubles as unknown[]).slice(0, 1);
    expect(ProjectPageSchema.safeParse(one).success).toBe(false);
  });
});

describe("ProfileSchema", () => {
  it("직함(role)이 없으면 실패한다", () => {
    const { role: _role, ...rest } = validProfileData();
    expect(ProfileSchema.safeParse(rest).success).toBe(false);
  });

  it("요건 7개가 모두 있으면 통과한다", () => {
    expect(ProfileSchema.safeParse(validProfileData()).success).toBe(true);
  });

  it("기술 목록은 그룹별로 1개 이상, 학습 여부는 기본 false", () => {
    const parsed = ProfileSchema.parse(validProfileData());
    expect(parsed.skills[0].items[0].learned).toBe(false);
    expect(parsed.skills[0].items[1].learned).toBe(true);
    const empty = { ...validProfileData(), skills: [{ group: "백엔드", items: [] }] };
    expect(ProfileSchema.safeParse(empty).success).toBe(false);
  });

  it("교육 주제는 이름과 선택 로고를 가진다", () => {
    const data = {
      ...validProfileData(),
      education: [{ org: "기관", course: "과정", period: "2026", topics: [{ name: "Python", icon: "python" }, { name: "RAG" }] }],
    };
    const parsed = ProfileSchema.parse(data);
    expect(parsed.education[0].topics[1]).toEqual({ name: "RAG" });
  });

  it("첫 화면 강조 문구(highlights)는 키워드와 설명 쌍, 1~5개", () => {
    const one = { ...validProfileData(), highlights: [{ keyword: "RAG", text: "근거를 제시합니다." }] };
    expect(ProfileSchema.safeParse(one).success).toBe(true);
    expect(ProfileSchema.safeParse({ ...validProfileData(), highlights: [] }).success).toBe(false);
  });

  it("요건 id가 중복되거나 빠지면 실패한다", () => {
    const data = validProfileData();
    const reqs = data.requirements as { id: string }[];
    reqs[1].id = "python-backend";
    expect(ProfileSchema.safeParse(data).success).toBe(false);
  });
});
