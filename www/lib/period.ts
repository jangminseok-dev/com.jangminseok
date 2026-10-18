// 프로젝트 기간 표시 — 메인 카드는 달 단위, 프로젝트 페이지는 날짜 그대로. 끝이 없으면 운영 중(live) 또는 진행 중
type Period = { start: string; end: string | null };

const month = (date: string) => date.slice(0, 7).replace("-", ".");

export function cardPeriod(period: Period, live = false): string {
  if (!period.end) return `${month(period.start)}부터 ${live ? "운영" : "진행"} 중`;
  const [start, end] = [month(period.start), month(period.end)];
  return start === end ? start : `${start} ~ ${end}`;
}

export const pagePeriod = (period: Period, live = false): string =>
  `${period.start} ~ ${period.end ?? (live ? "운영 중" : "진행 중")}`;
