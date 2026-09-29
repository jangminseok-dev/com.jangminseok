import { describe, expect, it } from "vitest";
import { ProfileSchema, ProjectSchema } from "@/lib/content/schema";
import { validProfileData, validProjectData } from "@/lib/content/fixtures";

describe("ProjectSchema", () => {
  it("최소 유효 데이터를 통과시킨다 (영상 없음 허용)", () => {
    const r = ProjectSchema.safeParse(validProjectData());
    expect(r.success).toBe(true);
  });

  it("스탯 박스 네 칸 중 하나라도 비면 실패한다", () => {
    const data = validProjectData();
    const slides = data.slides as { stats: Record<string, string> }[];
    slides[0].stats.cost = "";
    expect(ProjectSchema.safeParse(data).success).toBe(false);
  });

  it("accent는 #RRGGBB만 허용한다", () => {
    expect(ProjectSchema.safeParse(validProjectData({ accent: "red" })).success).toBe(false);
  });

  it("미디어 경로는 media/ 아래 webp·png·jpg·mp4만 허용한다", () => {
    const bad = validProjectData({ preview: { poster: "../secret.png" } });
    expect(ProjectSchema.safeParse(bad).success).toBe(false);
  });

  it("캡처가 없는 결정은 SVG 도식을 쓸 수 있다", () => {
    const data = validProjectData();
    const slides = data.slides as { frames: unknown[] }[];
    slides[0].frames = [{ image: "media/02-diagram.svg", caption: "도식" }];
    expect(ProjectSchema.safeParse(data).success).toBe(true);
  });

  it("정의되지 않은 키(오타)는 조용히 버리지 않고 실패한다", () => {
    expect(ProjectSchema.safeParse(validProjectData({ preview: { poster: "media/poster.webp", vidoe: "media/p.mp4" } })).success).toBe(false);
    const data = validProjectData();
    const slides = data.slides as Record<string, unknown>[];
    slides[0].concpet = { title: "t", body: "b" };
    expect(ProjectSchema.safeParse(data).success).toBe(false);
    expect(ProjectSchema.safeParse(validProjectData({ links: { blgo: "https://example.com" } })).success).toBe(false);
  });

  it("전체 시연 영상(preview.demo)을 선택적으로 받는다", () => {
    const data = validProjectData({ preview: { poster: "media/poster.webp", demo: "media/demo.mp4" } });
    expect(ProjectSchema.safeParse(data).success).toBe(true);
  });

  it("결정 슬라이드는 2~5장이다", () => {
    const data = validProjectData();
    const one = { ...data, slides: (data.slides as unknown[]).slice(0, 1) };
    expect(ProjectSchema.safeParse(one).success).toBe(false);
  });

  it("캡처는 1~3컷이다", () => {
    const data = validProjectData();
    const slides = data.slides as { frames: unknown[] }[];
    slides[0].frames = [1, 2, 3, 4].map((i) => ({ image: `media/${i}.webp`, caption: "c" }));
    expect(ProjectSchema.safeParse(data).success).toBe(false);
  });

  it("proves에 정의되지 않은 요건 id가 있으면 실패한다", () => {
    const data = validProjectData();
    const slides = data.slides as { proves: string[] }[];
    slides[0].proves = ["not-a-requirement"];
    expect(ProjectSchema.safeParse(data).success).toBe(false);
  });
});

describe("ProfileSchema", () => {
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

  it("요건 id가 중복되거나 빠지면 실패한다", () => {
    const data = validProfileData();
    const reqs = data.requirements as { id: string }[];
    reqs[1].id = "python-backend";
    expect(ProfileSchema.safeParse(data).success).toBe(false);
  });
});
