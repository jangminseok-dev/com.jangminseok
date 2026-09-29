import { describe, expect, it } from "vitest";
import { slideAnchor, slideKeyDelta } from "@/lib/slides";

describe("slideAnchor", () => {
  it("두 자리로 0을 채운다", () => {
    expect(slideAnchor(1)).toBe("01");
    expect(slideAnchor(7)).toBe("07");
    expect(slideAnchor(12)).toBe("12");
  });
});

describe("slideKeyDelta", () => {
  const key = (k: string, extra: Partial<Parameters<typeof slideKeyDelta>[0]> = {}) =>
    slideKeyDelta({ key: k, altKey: false, metaKey: false, ctrlKey: false, shiftKey: false, defaultPrevented: false, targetTag: "BODY", editable: false, ...extra });

  it("←→만 슬라이드를 넘긴다", () => {
    expect(key("ArrowRight")).toBe(1);
    expect(key("ArrowLeft")).toBe(-1);
  });

  it("↑↓·PageUp/Down·Space는 기본 스크롤에 맡긴다 (긴 슬라이드 아래쪽에 닿도록)", () => {
    for (const k of ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "]) expect(key(k)).toBe(0);
  });

  it("보조키 조합은 가로채지 않는다", () => {
    expect(key("ArrowLeft", { altKey: true })).toBe(0);
    expect(key("ArrowRight", { metaKey: true })).toBe(0);
    expect(key("ArrowRight", { ctrlKey: true })).toBe(0);
    expect(key("ArrowRight", { shiftKey: true })).toBe(0);
  });

  it("입력 요소·편집 영역·이미 처리된 이벤트는 무시한다", () => {
    expect(key("ArrowRight", { targetTag: "INPUT" })).toBe(0);
    expect(key("ArrowRight", { targetTag: "TEXTAREA" })).toBe(0);
    expect(key("ArrowRight", { editable: true })).toBe(0);
    expect(key("ArrowRight", { defaultPrevented: true })).toBe(0);
  });
});
