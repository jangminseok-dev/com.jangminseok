// 슬라이드 번호 → 앵커 id ("01"). 챗봇 출처·요건 매트릭스가 이 앵커로 링크한다.
export const slideAnchor = (n: number): string => String(n).padStart(2, "0");
