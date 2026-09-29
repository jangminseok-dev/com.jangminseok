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

  it("요건 id가 중복되거나 빠지면 실패한다", () => {
    const data = validProfileData();
    const reqs = data.requirements as { id: string }[];
    reqs[1].id = "python-backend";
    expect(ProfileSchema.safeParse(data).success).toBe(false);
  });
});
