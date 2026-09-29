import type { Profile } from "@/lib/content/schema";

export default function SiteFooter({ profile }: { profile: Profile }) {
  const { github, blog, email } = profile.links;
  return (
    <footer className="mx-auto max-w-5xl border-t border-line px-5 py-10 text-sm text-ink-mute">
      <div className="flex flex-wrap gap-4">
        <a href={github} target="_blank" rel="noreferrer" className="hover:text-ink">
          GitHub
        </a>
        {blog ? (
          <a href={blog} target="_blank" rel="noreferrer" className="hover:text-ink">
            블로그
          </a>
        ) : null}
        {email ? (
          <a href={`mailto:${email}`} className="hover:text-ink">
            {email}
          </a>
        ) : null}
      </div>
      <p className="mt-4">© 2026 {profile.name}</p>
    </footer>
  );
}
