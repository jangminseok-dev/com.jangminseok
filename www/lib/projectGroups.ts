type Groupable = { slug: string; period: { start: string }; team: { size: number } };

// 메인 프로젝트 목록 — 팀 프로젝트를 먼저, 각 그룹 안에서는 최근에 시작한 것부터(같은 날이면 slug 순). 빈 그룹은 뺀다
export function groupProjects<T extends Groupable>(projects: T[]): { title: string; items: T[] }[] {
  const newestFirst = (a: T, b: T) => b.period.start.localeCompare(a.period.start) || a.slug.localeCompare(b.slug);
  return [
    { title: "팀 프로젝트", items: projects.filter((p) => p.team.size > 1).sort(newestFirst) },
    { title: "개인 프로젝트", items: projects.filter((p) => p.team.size === 1).sort(newestFirst) },
  ].filter((g) => g.items.length > 0);
}
