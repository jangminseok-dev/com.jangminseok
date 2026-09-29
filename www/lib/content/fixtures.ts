// 테스트 전용 — 스키마를 통과하는 최소 데이터
export function validProjectData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const decision = (title: string) => ({
    title,
    summary: "요약 문장",
    stats: { problem: "문제", choice: "선택", cost: "대가", effect: "근거 없음" },
    frames: [{ image: "media/03-1.webp", caption: "전" }],
    alternatives: [{ name: "대안", reason: "버린 이유" }],
    evidence: [{ label: "README" }],
    proves: ["rag"],
  });
  return {
    slug: "demo",
    order: 1,
    title: "Demo",
    tagline: "한 줄 정의",
    accent: "#ef4444",
    period: { start: "2026-01-01", end: null },
    team: { size: 1, role: "1인 개발" },
    stack: ["FastAPI"],
    languages: ["Python"],
    preview: { poster: "media/poster.webp" },
    links: {},
    slides: [decision("설계 원칙"), decision("핵심 결정")],
    retro: { metrics: [], regrets: ["아쉬운 점"] },
    ...overrides,
  };
}

export function validProfileData(): Record<string, unknown> {
  return {
    name: "장민석",
    headline: "헤드라인",
    intro: "소개",
    highlights: [{ keyword: "키워드", text: "설명입니다." }],
    requirements: [
      { id: "python-backend", label: "Python 백엔드", detail: "d" },
      { id: "search-engine", label: "검색엔진", detail: "d" },
      { id: "rag", label: "RAG", detail: "d" },
      { id: "hybrid-search", label: "하이브리드 검색", detail: "d" },
      { id: "linux-docker", label: "Linux·Docker", detail: "d" },
      { id: "git", label: "Git 협업", detail: "d" },
      { id: "ai-assistant", label: "AI 코딩 어시스턴트", detail: "d" },
    ],
    education: [],
    skills: [{ group: "백엔드", items: [{ name: "Python", icon: "python" }, { name: "Java", learned: true }] }],
    links: { github: "https://github.com/jangminseok-dev" },
  };
}
