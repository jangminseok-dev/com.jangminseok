// 서브도메인으로 인정할 루트. localhost는 로컬 확인용(redoceanmap.localhost:3000).
const ROOT_DOMAINS = ["jangminseok.com", "localhost"] as const;

export function projectSlugFromHost(host: string | null, slugs: readonly string[]): string | null {
  if (!host) return null;
  const hostname = host.toLowerCase().split(":")[0];
  for (const root of ROOT_DOMAINS) {
    const suffix = `.${root}`;
    if (!hostname.endsWith(suffix)) continue;
    const sub = hostname.slice(0, -suffix.length);
    return slugs.includes(sub) ? sub : null;
  }
  return null;
}
