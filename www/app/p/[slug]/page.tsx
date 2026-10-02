import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NightBackdrop from "@/components/home/NightBackdrop";
import SiteNav from "@/components/home/SiteNav";
import ProjectReview from "@/components/project/ProjectReview";
import { accentStyle } from "@/lib/accent";
import { getProfile, getProject, getProjects } from "@/lib/content";
import { SITE_DOMAIN, isProdSite, mainHref } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} | 장민석`,
    description: project.page.overview.what,
    alternates: { canonical: `https://${slug}.${SITE_DOMAIN}` },
    icons: { icon: { url: `/icons/${slug}.svg`, type: "image/svg+xml" } },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const home = mainHref(isProdSite());
  return (
    <>
      <NightBackdrop />
      <SiteNav name={getProfile().name} github={getProfile().links.github} base={home} />
      <main style={accentStyle(project.accent)} className="text-white">
        <ProjectReview project={project} mainHref={home} />
      </main>
    </>
  );
}
