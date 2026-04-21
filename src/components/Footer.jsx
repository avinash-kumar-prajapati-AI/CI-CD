import { SITE_PROFILE } from '../lib/constants';

export function Footer() {
  return (
    <footer className="container-shell pb-8 pt-12">
      <div className="glass-panel flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="theme-muted text-sm">
          Built with React + GitHub API · © {new Date().getFullYear()} {SITE_PROFILE.name}
        </p>
        <div className="flex items-center gap-3">
          {SITE_PROFILE.socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="theme-chip flex h-11 w-11 items-center justify-center rounded-full transition hover:text-[var(--accent-primary)] hover:shadow-neon"
                aria-label={social.label}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
