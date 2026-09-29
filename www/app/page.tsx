import EducationList from "@/components/home/EducationList";
import Hero from "@/components/home/Hero";
import SiteNav from "@/components/home/SiteNav";
import NightBackdrop from "@/components/home/NightBackdrop";
import ProjectGrid from "@/components/home/ProjectGrid";
import RequirementMatrix from "@/components/home/RequirementMatrix";
import SiteFooter from "@/components/home/SiteFooter";
import { getProfile, getProjectPage, getProjects } from "@/lib/content";
import { buildRequirementMatrix } from "@/lib/matrix";
import { isProdSite } from "@/lib/site";

// 카드에 보일 역할 한 줄 — 새 소개 페이지(page.yaml)가 있으면 그 한 줄, 없으면 기존 역할 문구
const roleLines = (projects: { slug: string; team: { role: string } }[]): Record<string, string> =>
  Object.fromEntries(projects.map((p) => [p.slug, getProjectPage(p.slug)?.overview.role ?? p.team.role]));

export default function HomePage() {
  const profile = getProfile();
  const projects = getProjects();
  const isProd = isProdSite();
  return (
    <>
      <NightBackdrop />
      <SiteNav name={profile.name} github={profile.links.github} />
      <main>
        <Hero
          profile={profile}
          projectCount={projects.length}
          teamProjectCount={projects.filter((p) => p.team.size > 1).length}
          skillsNote="프로젝트에서 직접 쓴 기술과 교육에서 다뤄본 기술을 나눠 적었습니다."
        />
        <ProjectGrid projects={projects} isProd={isProd} roles={roleLines(projects)} />
        <RequirementMatrix rows={buildRequirementMatrix(profile.requirements, projects)} isProd={isProd} />
        <EducationList education={profile.education} />
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
