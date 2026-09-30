"""골든셋 평가 CLI — 무료 한도 때문에 로컬에서 수동 실행한다.

python -m agent.eval.run                 # 전체 평가 1회(LLM 포함) → eval.json의 runs에 누적, 지표는 최근 3회 최저값
python -m agent.eval.run --only 6,9      # 진단: 지정 문항만 돌려 호출한 도구와 답변을 출력(eval.json에 쓰지 않음)
"""
import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

from agent.adapter.outbound.gemini_llm import GeminiToolLlm
from agent.app.ask import AskInteractor, AskResult
from agent.app.ports import LlmUnavailable
from agent.app.tool_runner import ToolRunner
from agent.eval.scoring import score_case, summarize
from catalog.dependencies.catalog_gateway import get_catalog_gateway
from core.config import BANNED_TERMS, GEMINI_MODEL, MAX_TOOL_CALLS
from knowledge.dependencies.search_gateway import get_search_gateway

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[2] / "data" / "eval.json"  # 백엔드 산출물 — 포트폴리오 섹션이 이 수치를 인용한다
KEEP_RUNS = 3  # 최저값을 낼 최근 실행 수 — 무료 RPD 500이라 하루 1회씩 쌓는다
PAUSE_SEC = 12  # 무료 분당 한도 15회 — 질문 하나가 2~3회 호출
RETRY_WAIT_SEC, RETRIES = 30, 3  # 429를 만나면 기다렸다 같은 질문을 다시


def _load() -> dict:
    return json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}


def _save(data: dict) -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


async def _ask_with_retry(ask: AskInteractor, question: str) -> AskResult:
    for attempt in range(RETRIES):
        try:
            return await ask.ask(question)
        except LlmUnavailable:
            if attempt == RETRIES - 1:
                raise
            print(f"   429 — {RETRY_WAIT_SEC}초 뒤 다시", flush=True)
            await asyncio.sleep(RETRY_WAIT_SEC)
    raise AssertionError("unreachable")


async def full_run(cases: list[dict]) -> dict[str, float]:
    catalog = get_catalog_gateway()
    ask = AskInteractor(GeminiToolLlm(), ToolRunner(catalog, get_search_gateway()), catalog, BANNED_TERMS,
                        MAX_TOOL_CALLS)
    scores = []
    for i, c in enumerate(cases, 1):
        s = score_case(c, await _ask_with_retry(ask, c["question"]))
        scores.append(s)
        print(f"{i:02d} tool={s.tool_ok} args={s.args_ok} hit5={s.hit5} content={s.content_ok} refuse={s.refuse_ok}"
              f"  {c['question']}", flush=True)
        await asyncio.sleep(PAUSE_SEC)
    return summarize(scores)


async def diagnose(cases: list[dict], numbers: list[int]) -> None:
    catalog = get_catalog_gateway()
    ask = AskInteractor(GeminiToolLlm(), ToolRunner(catalog, get_search_gateway()), catalog, BANNED_TERMS,
                        MAX_TOOL_CALLS)
    for n in numbers:
        c = cases[n - 1]
        r = await _ask_with_retry(ask, c["question"])
        print(f"{n:02d} {c['question']}\n   기대 {c['expected_tools']} {c['expected_args']}"
              f"\n   호출 {[(t.name, t.args, t.ok) for t in r.tool_calls]} refused={r.refused}"
              f"\n   근거 {[f'{s.slug}#{s.section_number:02d}' for s in r.sources[:5]]}\n   답 {r.answer[:220]}", flush=True)
        await asyncio.sleep(PAUSE_SEC)


async def main() -> None:
    cases = yaml.safe_load((HERE / "golden.yaml").read_text(encoding="utf-8"))
    data = _load()
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    if "--only" in sys.argv:
        await diagnose(cases, [int(x) for x in sys.argv[sys.argv.index("--only") + 1].split(",")])
        return
    runs = (data.get("runs") or []) + [{"run_at": now, "metrics": await full_run(cases)}]
    runs = runs[-KEEP_RUNS:]
    data.update({"model": GEMINI_MODEL, "n": len(cases), "runs": runs,
                 "metrics": {k: min(r["metrics"][k] for r in runs if k in r["metrics"]) for k in runs[-1]["metrics"]}})
    _save(data)
    print(json.dumps(data["metrics"], ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())
