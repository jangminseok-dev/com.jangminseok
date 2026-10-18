import EducationList from "@/components/home/EducationList";
import Hero from "@/components/home/Hero";
import SiteNav from "@/components/home/SiteNav";
import NightBackdrop from "@/components/home/NightBackdrop";
import ProjectGrid from "@/components/home/ProjectGrid";
import SiteFooter from "@/components/home/SiteFooter";
import TroubleLog from "@/components/home/TroubleLog";
import WorkStyle from "@/components/home/WorkStyle";
import { getProfile, getProjects } from "@/lib/content";
import { isProdSite } from "@/lib/site";

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
          projects={projects}
          isProd={isProd}
          skillsNote="프로젝트에서 직접 쓴 기술과 교육에서 다뤄본 기술을 나눠 적었습니다. 기술을 누르면 쓴 곳이 나옵니다."
        />
        <ProjectGrid projects={projects} isProd={isProd} />
        <TroubleLog projects={projects} isProd={isProd} />
        <WorkStyle projects={projects} isProd={isProd} />
        <EducationList education={profile.education} />
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
