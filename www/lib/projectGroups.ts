type Groupable = { order: number; team: { size: number } };

// 메인 프로젝트 목록 — 팀 프로젝트를 먼저, 각 그룹 안에서는 project.yaml의 order순. 빈 그룹은 뺀다
export function groupProjects<T extends Groupable>(projects: T[]): { title: string; items: T[] }[] {
  const byOrder = (a: T, b: T) => a.order - b.order;
  return [
    { title: "팀 프로젝트", items: projects.filter((p) => p.team.size > 1).sort(byOrder) },
    { title: "개인 프로젝트", items: projects.filter((p) => p.team.size === 1).sort(byOrder) },
  ].filter((g) => g.items.length > 0);
}

// 두 칸 그리드에서 카드 수가 홀수면 첫 카드를 두 칸으로 넓혀 빈칸을 없앤다
export const isWideCard = (index: number, count: number): boolean => index === 0 && count % 2 === 1;
