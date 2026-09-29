import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NightBackdrop from "@/components/home/NightBackdrop";
import SiteNav from "@/components/home/SiteNav";
import ProjectReview from "@/components/project/ProjectReview";
import { accentStyle } from "@/components/slides/Slide";
import { getProfile, getProject, getProjectPage, getProjects } from "@/lib/content";
import { isProdSite, mainHref } from "@/lib/site";

// 소개 페이지 v2 시범 — 확정 전까지 검색 노출 없이 page.yaml이 있는 프로젝트만 만든다
type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return getProjects()
    .filter((p) => getProjectPage(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export default async function PreviewPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  const page = getProjectPage(slug);
  if (!project || !page) notFound();

  const home = mainHref(isProdSite());
  return (
    <>
      <NightBackdrop />
      <SiteNav name={getProfile().name} github={getProfile().links.github} base={home} />
      <main style={accentStyle(project.accent)} className="text-white">
        <ProjectReview project={project} page={page} mainHref={home} />
      </main>
    </>
  );
}
