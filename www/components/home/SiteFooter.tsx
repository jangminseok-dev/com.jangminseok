import type { Profile } from "@/lib/content/schema";
import { skillIcon } from "@/lib/icons";

function Logo({ slug }: { slug: string }) {
  const icon = skillIcon(slug);
  return icon ? (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0" fill="currentColor">
      <path d={icon.path} />
    </svg>
  ) : null;
}

export default function SiteFooter({ profile }: { profile: Profile }) {
  const { github, blog, email } = profile.links;
  const contacts = [
    { label: "GitHub", value: github.replace(/^https:\/\//, ""), href: github, icon: "github" },
    ...(email ? [{ label: "Email", value: email, href: `mailto:${email}`, icon: "gmail" }] : []),
    ...(blog ? [{ label: "Blog", value: blog.replace(/^https:\/\//, ""), href: blog, icon: "jekyll" }] : []),
  ];
  return (
    <footer id="contact" className="mx-auto max-w-7xl px-5 pb-12 pt-16">
      <div className="glass rounded-3xl p-6 md:p-8">
        <h2 className="text-2xl font-bold md:text-3xl">연락처</h2>
        <p className="mt-2 text-white/70">채용이나 협업 문의는 이메일로 보내 주시면 확인 후 답장드리겠습니다.</p>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {contacts.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3.5 hover:bg-white/15"
              >
                <Logo slug={c.icon} />
                <span className="min-w-0">
                  <span className="block text-xs text-white/55">{c.label}</span>
                  <span className="block truncate font-medium">{c.value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-8 text-center text-sm text-white/45">© 2026 {profile.name}</p>
    </footer>
  );
}
