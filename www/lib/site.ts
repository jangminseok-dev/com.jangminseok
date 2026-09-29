export const SITE_DOMAIN = "jangminseok.com";

// Vercel 운영 배포에서만 서브도메인 절대 URL을 쓴다. 로컬·프리뷰는 /p/{slug}.
export const isProdSite = (): boolean => process.env.VERCEL_ENV === "production";

export const projectHref = (slug: string, isProd: boolean): string =>
  isProd ? `https://${slug}.${SITE_DOMAIN}` : `/p/${slug}`;

export const mainHref = (isProd: boolean): string => (isProd ? `https://${SITE_DOMAIN}` : "/");
