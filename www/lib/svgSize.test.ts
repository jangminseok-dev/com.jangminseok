import { describe, expect, it } from "vitest";
import { svgSize } from "@/lib/svgSize";

describe("svgSize", () => {
  it("viewBox에서 가로세로 크기를 읽는다", () => {
    expect(svgSize('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 680"><rect/></svg>')).toEqual({ width: 1200, height: 680 });
  });

  it("viewBox가 없으면 width와 height 속성을 쓴다", () => {
    expect(svgSize('<svg width="960" height="540px"><g/></svg>')).toEqual({ width: 960, height: 540 });
  });

  it("viewBox와 width가 함께 있으면 viewBox가 우선이다", () => {
    expect(svgSize('<svg width="100%" viewBox="0 0 800 450">')).toEqual({ width: 800, height: 450 });
  });

  it("크기를 알 수 없으면 null이다", () => {
    expect(svgSize('<svg width="100%" height="100%"></svg>')).toBeNull();
    expect(svgSize("<div>svg가 아님</div>")).toBeNull();
    expect(svgSize('<svg viewBox="0 0 0 0"></svg>')).toBeNull();
  });
});
