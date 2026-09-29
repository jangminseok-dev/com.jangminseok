// 슬라이드 번호 → 앵커 id ("01"). 챗봇 출처·요건 매트릭스가 이 앵커로 링크한다.
export const slideAnchor = (n: number): string => String(n).padStart(2, "0");

export type SlideKey = {
  key: string;
  altKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  defaultPrevented: boolean;
  targetTag: string;
  editable: boolean;
};

const DELTA: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
const TYPING_TAGS = ["INPUT", "TEXTAREA", "SELECT"];

// 슬라이드 넘김은 ←→만. ↑↓·PageUp/Down·Space는 브라우저 기본 스크롤에 맡겨
// 화면보다 긴 슬라이드의 아래쪽에도 키보드로 닿게 한다.
export function slideKeyDelta(e: SlideKey): number {
  if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return 0;
  if (e.editable || TYPING_TAGS.includes(e.targetTag)) return 0;
  return DELTA[e.key] ?? 0;
}
