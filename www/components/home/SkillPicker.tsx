"use client";

import { useState } from "react";

// 기술 칩을 누르면 그 기술의 근거가 칩 줄 아래에 펼쳐진다 — 칩 모양은 서버가 그린 것을 받는다(로고 라이브러리를 브라우저로 보내지 않게)
export type PickerProject = { slug: string; title: string; accent: string; team: boolean; href: string };
export type PickerEvidence =
  | { kind: "projects"; projects: PickerProject[] }
  | { kind: "courses"; courses: string[] }
  | { kind: "none" };
export type PickerGroup = { group: string; items: { name: string; chip: React.ReactNode; evidence: PickerEvidence }[] };

const panelId = (name: string) => `skill-${name.toLowerCase().replace(/[^0-9a-z]/g, "")}`;

function Evidence({ evidence }: { evidence: PickerEvidence }) {
  if (evidence.kind === "courses") {
    return (
      <>
        <p className="text-white/70">교육 과정에서 다뤘습니다</p>
        <ul className="mt-2 space-y-1">
          {evidence.courses.map((c) => (
            <li key={c} className="text-white/90">
              {c}
            </li>
          ))}
        </ul>
      </>
    );
  }
  if (evidence.kind !== "projects") return null;
  const hasTeam = evidence.projects.some((p) => p.team);
  return (
    <>
      <p className="text-white/70">이 기술을 쓴 프로젝트 {evidence.projects.length}개</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {evidence.projects.map((p) => (
          <li key={p.slug}>
            <a href={p.href} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 font-semibold text-white hover:bg-white/20">
              <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: p.accent }} />
              {p.title}
              <span className="font-normal text-white/60">{p.team ? "팀" : "개인"}</span>
            </a>
          </li>
        ))}
      </ul>
      {hasTeam ? <p className="mt-2 text-white/60">팀 프로젝트는 팀이 함께 쓴 기술입니다. 제가 맡은 일은 각 프로젝트 페이지에 있습니다.</p> : null}
    </>
  );
}

export default function SkillPicker({ groups }: { groups: PickerGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <dl className="mt-5 space-y-4">
      {groups.map((g) => {
        const opened = g.items.find((i) => i.name === open);
        return (
          <div key={g.group} className="grid grid-cols-1 gap-2 sm:grid-cols-[5.5rem_1fr]">
            <dt className="pt-1.5 text-sm font-semibold text-white/70">{g.group}</dt>
            <dd>
              <div className="flex flex-wrap gap-2">
                {g.items.map((i) =>
                  i.evidence.kind === "none" ? (
                    <span key={i.name}>{i.chip}</span>
                  ) : (
                    <button
                      key={i.name}
                      type="button"
                      aria-expanded={open === i.name}
                      aria-controls={panelId(i.name)}
                      onClick={() => setOpen(open === i.name ? null : i.name)}
                      className="rounded-lg hover:brightness-125 aria-expanded:outline-2 aria-expanded:outline-brand-soft"
                    >
                      {i.chip}
                    </button>
                  ),
                )}
              </div>
              {opened ? (
                <div id={panelId(opened.name)} className="mt-3 rounded-xl border border-white/15 bg-night/85 p-3 text-sm">
                  <Evidence evidence={opened.evidence} />
                </div>
              ) : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
