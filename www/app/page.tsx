import EducationList from "@/components/home/EducationList";
import Hero from "@/components/home/Hero";
import NightBackdrop from "@/components/home/NightBackdrop";
import ProjectGrid from "@/components/home/ProjectGrid";
import RequirementMatrix from "@/components/home/RequirementMatrix";
import SiteFooter from "@/components/home/SiteFooter";
import { getProfile, getProjects } from "@/lib/content";
import { buildRequirementMatrix } from "@/lib/matrix";
import { isProdSite } from "@/lib/site";

export default function HomePage() {
  const profile = getProfile();
  const projects = getProjects();
  const isProd = isProdSite();
  return (
    <>
      <NightBackdrop />
      <main>
        <Hero profile={profile} />
        <RequirementMatrix rows={buildRequirementMatrix(profile.requirements, projects)} isProd={isProd} />
        <ProjectGrid projects={projects} isProd={isProd} />
        <EducationList education={profile.education} />
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
