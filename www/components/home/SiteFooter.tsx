import type { Profile } from "@/lib/content/schema";

export default function SiteFooter({ profile }: { profile: Profile }) {
  const { github, blog, email } = profile.links;
  return (
    <footer className="mx-auto max-w-6xl border-t border-white/10 px-5 py-10 text-sm text-white/55">
      <div className="flex flex-wrap gap-4">
        <a href={github} target="_blank" rel="noreferrer" className="hover:text-white">
          GitHub
        </a>
        {blog ? (
          <a href={blog} target="_blank" rel="noreferrer" className="hover:text-white">
            블로그
          </a>
        ) : null}
        {email ? (
          <a href={`mailto:${email}`} className="hover:text-white">
            {email}
          </a>
        ) : null}
      </div>
      <p className="mt-4">© 2026 {profile.name}</p>
    </footer>
  );
}
