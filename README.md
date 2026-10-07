# jangminseok.com

AI 서비스 개발자 장민석의 포트폴리오 사이트 저장소입니다.

사이트: https://jangminseok.com

## 이 사이트에서 볼 수 있는 것

- **프로젝트 소개 페이지 8개.** 프로젝트마다 무엇을 만들었는지, 전체 구조, 맡은 일, 어려웠던 점을 한 페이지에 정리했습니다. 각 페이지는 `callguard.jangminseok.com`처럼 자기 주소를 가집니다.
- **포트폴리오에 질문하는 AI 챗봇.** 화면 아래 입력창에 질문하면 AI가 프로젝트 문서를 찾아 답하고, 근거가 된 페이지 링크를 붙입니다. 포트폴리오와 무관한 질문에는 답하지 않습니다.
- **MCP 서버.** Claude 같은 AI 앱의 커넥터에 `https://api.jangminseok.com/mcp/`를 등록하면, 그 앱에서도 같은 도구로 포트폴리오를 조회할 수 있습니다.

## 프로젝트

| 프로젝트 | 내용 | 인원 |
| --- | --- | --- |
| [CallGuard](https://callguard.jangminseok.com) | 콜센터 통화를 실시간으로 들으며 필요한 문서를 상담원 화면에 띄우고, 개인정보는 화면에 뜨기 전에 가립니다 | 4명 |
| [RedOceanMap](https://redoceanmap.jangminseok.com) | 서울 상권 공공데이터와 주식 시세를 대화로 분석합니다 | 1인 |
| [차곡노트](https://chagocnote.jangminseok.com) | 반려동물 미용 매장의 예약, 고객, 미용 기록을 관리합니다 | 1인 |
| [REMAKE DAY](https://remakeday.jangminseok.com) | AI 인물과 대화하는 추리 게임을, 사람이 AI 제안을 어떻게 받아들이는지 기록하는 실험 환경으로 설계했습니다 | 5명 |
| [localhost:daegu](https://localhostdaegu.jangminseok.com) | 대구 예비 창업자가 상권을 확인하고 필요 자금을 계산합니다 | 3명 |
| [발자국](https://balzaguk.jangminseok.com) | 반려견의 특성과 공공데이터로 함께 갈 수 있는 여행 동선을 짜 줍니다 | 4명 |
| [JB Silver Connect](https://jbconnect.jangminseok.com) | 60세 이상 고객이 AI 금융 도우미와 상담하고 창구까지 이어지는 서비스입니다 | 4명 |
| [jangminseok.com](https://portfolio.jangminseok.com) | 이 저장소입니다 | 1인 |

팀 프로젝트에서 제가 맡은 부분은 각 소개 페이지의 "맡은 일"에 나누어 적었습니다.

## 챗봇이 답하는 방식

1. AI가 질문을 읽고 도구 3개 중 필요한 것을 고릅니다. 문서 검색, 프로젝트 조회, 기술별 프로젝트 찾기입니다. 한 질문에 도구는 최대 3번까지 부릅니다.
2. 문서 검색은 키워드 검색과 벡터 검색으로 각각 찾은 뒤 두 순위를 합치는 하이브리드 검색입니다.
3. AI가 쓴 답은 코드가 마지막으로 확인합니다. 문서에 없는 숫자가 들어간 문장과 없는 페이지 링크는 지우고, 공개하면 안 되는 이름이 있으면 답 전체를 막습니다.

사이트 챗봇과 MCP 서버는 같은 도구 코드를 부르는 입구일 뿐입니다. 입구가 도구 내부를 직접 건드리지 못하게 import-linter로 막았습니다.

## 답변 품질 평가

직접 만든 골든셋 30문항으로 챗봇을 채점합니다. 알맞은 도구를 골랐는지, 정답 문서를 상위 5개 안에 찾았는지, 답에 핵심 사실이 들어갔는지, 무관한 질문을 거절했는지 봅니다.

- 골든셋: [`minseok/apps/agent/eval/golden.yaml`](minseok/apps/agent/eval/golden.yaml)
- 채점 결과: [`minseok/data/eval.json`](minseok/data/eval.json)

전체 평가는 무료 AI 한도 안에서 수동으로 돌립니다. 최근 3회 중 가장 낮은 값을 사이트에 공개합니다.

## 저장소 구조

| 폴더 | 내용 | 기술 |
| --- | --- | --- |
| `content/` | 프로젝트 소개 글과 이미지. 사이트와 챗봇이 함께 쓰는 원본입니다 | YAML |
| `www/` | 사이트 화면 | Next.js 16, React 19, TypeScript, Tailwind CSS |
| `minseok/` | 챗봇과 MCP 서버, 검색, 평가 | Python 3.13, FastAPI, SQLAlchemy 2, PostgreSQL, pgvector, Gemini |

## 운영

화면과 서버는 Vercel, 데이터베이스는 Supabase, AI는 Gemini의 무료 한도로 운영합니다. 도메인을 빼면 월 운영비는 0원입니다. push할 때마다 GitHub Actions가 테스트, 구조 규칙 검사, 빌드를 돌립니다.

## 로컬에서 실행하기

사이트 화면:

```bash
cd www
pnpm install
pnpm run dev
```

`http://localhost:3000`에서 열립니다. 프로젝트 페이지는 `http://callguard.localhost:3000`처럼 확인합니다.

챗봇 서버는 Supabase 데이터베이스와 Gemini API 키가 필요합니다. `minseok/.env.example`을 `.env`로 복사해 값을 채운 뒤 실행합니다.

```bash
cd minseok
python3.13 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/pytest -q -m "not network"
```

## 개발 방식

Claude Code와 함께 개발했습니다. AI가 쓴 코드는 세 가지로 검증했습니다. 구조 규칙은 import-linter가, 기능은 테스트가, 답변 품질은 골든셋 평가가 확인합니다.
