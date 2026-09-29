import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { accentStyle } from "@/components/slides/Slide";
import SlideDeck from "@/components/slides/SlideDeck";
import SlideDecision from "@/components/slides/SlideDecision";
import SlideIntro from "@/components/slides/SlideIntro";
import SlideRetro from "@/components/slides/SlideRetro";
import { getProject, getProjects } from "@/lib/content";
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
    title: `${project.title} · 장민석`,
    description: project.tagline,
    alternates: { canonical: `https://${slug}.${SITE_DOMAIN}` },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const home = mainHref(isProdSite());
  const count = project.slides.length + 2;

  return (
    <main style={accentStyle(project.accent)} className="bg-slide-bg text-white">
      <SlideDeck count={count}>
        <SlideIntro project={project} mainHref={home} />
        {project.slides.map((slide, i) => (
          <SlideDecision key={slide.title} n={i + 2} slug={slug} slide={slide} />
        ))}
        <SlideRetro n={count} project={project} mainHref={home} />
      </SlideDeck>
    </main>
  );
}
