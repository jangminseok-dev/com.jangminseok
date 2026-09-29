// 프로젝트 목록을 성장 순서(시작일이 이른 것부터)로 — 같은 날이면 slug 순으로 고정
type Dated = { slug: string; period: { start: string } };

export const byStartDate = (a: Dated, b: Dated): number =>
  a.period.start.localeCompare(b.period.start) || a.slug.localeCompare(b.slug);
