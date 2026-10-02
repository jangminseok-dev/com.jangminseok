// 본인 방문을 Vercel Analytics에서 빼는 쿠키 — /api/notrack이 심고, components/SiteAnalytics가 읽는다
export const OPT_OUT_COOKIE = "va-disable";

export const isOptedOut = (cookie: string): boolean =>
  cookie.split(";").some((c) => c.trim().startsWith(`${OPT_OUT_COOKIE}=`));
