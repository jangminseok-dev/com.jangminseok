// 테스트 전용 — 스키마를 통과하는 최소 데이터
export function validProjectData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
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
    tags: ["FastAPI"],
    preview: { poster: "media/poster.webp" },
    links: {},
    ...overrides,
  };
}

// 소개 페이지(page.yaml) 최소 데이터 — 미디어는 media/arch.svg 하나
export function validPageData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const two = (t: string) => [1, 2].map((i) => ({ title: `${t}${i}`, body: "설명입니다." }));
  return {
    overview: { what: "무엇", why: "왜", role: "역할 한 줄", highlights: [{ value: "1", label: "수치" }] },
    features: two("기능"),
    architecture: { image: "media/arch.svg", summary: "요약", points: two("포인트"), layers: [{ name: "서버", items: ["FastAPI"] }] },
    role: { summary: "요약", mine: ["한 일"] },
    troubles: [1, 2].map((i) => ({ title: `문제${i}`, problem: "문제", solution: "해결", result: "결과" })),
    retro: { metrics: [], regrets: ["아쉬운 점"] },
    proves: [{ id: "rag", label: "한 줄 설명", anchor: "05" }],
    ...overrides,
  };
}

export function validProfileData(): Record<string, unknown> {
  return {
    name: "장민석",
    role: "AI 백엔드 엔지니어",
    headline: "헤드라인",
    intro: "소개",
    highlights: [{ keyword: "키워드", text: "설명입니다." }],
    requirements: [
      { id: "python-backend", label: "Python 백엔드", detail: "d" },
      { id: "search-engine", label: "검색엔진", detail: "d" },
      { id: "rag", label: "RAG", detail: "d" },
      { id: "hybrid-search", label: "하이브리드 검색", detail: "d" },
      { id: "agent-tools", label: "에이전트와 도구 호출", detail: "d" },
      { id: "linux-docker", label: "Linux·Docker", detail: "d" },
      { id: "git", label: "Git 협업", detail: "d" },
      { id: "ai-assistant", label: "AI 코딩 어시스턴트", detail: "d" },
    ],
    education: [],
    skills: [{ group: "백엔드", items: [{ name: "Python", icon: "python" }, { name: "Java", learned: true }] }],
    links: { github: "https://github.com/jangminseok-dev" },
  };
}
