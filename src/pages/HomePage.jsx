import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { HeroCanvas } from '../components/HeroCanvas';
import { SectionHeading } from '../components/SectionHeading';
import { ArticleCard } from '../components/ArticleCard';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { SITE_PROFILE, TECH_STACK } from '../lib/constants';
import { useAllArticlesQuery } from '../hooks/useGitHubBlog';
import { useThemeStore } from '../store/themeStore';

export function HomePage() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const latestPostsQuery = useAllArticlesQuery();
  const { theme } = useThemeStore();

  useEffect(() => {
    const role = SITE_PROFILE.roles[roleIndex];
    let frame = 0;
    let cancelled = false;

    function type() {
      if (cancelled) return;
      const nextLength = Math.min(role.length, frame + 1);
      setTypedText(role.slice(0, nextLength));
      frame = nextLength;

      if (nextLength < role.length) {
        window.setTimeout(type, 65);
      } else {
        window.setTimeout(() => {
          if (cancelled) return;
          setRoleIndex((current) => (current + 1) % SITE_PROFILE.roles.length);
          setTypedText('');
        }, 1800);
      }
    }

    const timer = window.setTimeout(type, 240);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [roleIndex]);

  const latestPosts = useMemo(() => (latestPostsQuery.data || []).slice(0, 3), [latestPostsQuery.data]);
  const projectPosts = useMemo(
    () =>
      (latestPostsQuery.data || [])
        .filter((article) => ['project', 'projects'].includes(article.category))
        .slice(0, 6),
    [latestPostsQuery.data]
  );

  return (
    <div className="space-y-10">
      <section className="container-shell relative overflow-hidden pb-10 pt-4">
        <div className="glass-card relative min-h-[72vh] overflow-hidden bg-hero-radial">
          <div className="absolute inset-0">
            <HeroCanvas />
          </div>
          <div className="relative z-10 grid min-h-[72vh] items-center gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="theme-accent mb-4 text-sm font-semibold uppercase tracking-[0.3em]"
              >
                Recruiter-ready portfolio + GitHub-native publishing
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="hero-title font-display text-4xl font-bold leading-tight sm:text-6xl"
              >
                <span className="heading-gradient">{SITE_PROFILE.name}</span> building readable products with practical AI and frontend execution.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
                className="theme-muted mt-6 max-w-2xl text-lg leading-8"
              >
                {SITE_PROFILE.shortBio}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                className="theme-accent mt-8 flex min-h-10 items-center text-xl font-medium"
              >
                <span>{typedText}</span>
                <span className="ml-1 inline-block h-6 w-[2px] animate-blink bg-[var(--accent-primary)]" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`mt-4 inline-flex rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] shadow-neon ${
                  theme === 'light'
                    ? 'border border-sky-300/50 bg-white/70 text-sky-900'
                    : 'border border-[var(--accent-border)] bg-slate-950/45 text-cyan-100'
                }`}
              >
                Quick scan: work, writing, and direct contact links
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 }}
              className="glass-card ml-auto max-w-xl p-6 sm:p-8"
            >
              <p className="theme-soft text-sm uppercase tracking-[0.28em]">Recruiter Snapshot</p>
              <h2 className="theme-title mt-3 font-display text-2xl sm:text-3xl">A focused place to review projects, blog writing, and professional links without a backend dependency.</h2>
              <p className="theme-muted mt-4 text-sm leading-7">
                This portfolio highlights selected builds, recent writing, and direct paths to GitHub, LinkedIn, and email so a recruiter or hiring manager can evaluate experience quickly.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="#projects"
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="button-primary justify-between"
                >
                  <span>View Projects</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/blog"
                  className="button-secondary justify-between"
                >
                  <span>Read Writing</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-shell overflow-hidden">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Core Stack"
            title="Technologies that support modern frontend and AI-adjacent product work"
            description="A quick recruiter-facing view of the tools used across the portfolio, blog workflow, and interface builds."
          />
        </div>
        <div className="relative overflow-hidden">
          <div className="flex min-w-max gap-4 px-4 sm:px-6">
            <div className="flex min-w-max animate-marquee gap-4">
              {[...TECH_STACK, ...TECH_STACK].map((item, index) => (
                <motion.div
                  key={`${item}-${index}`}
                  whileHover={{ rotateX: 8, rotateY: -8, y: -6 }}
                  className="glass-card theme-title flex min-h-14 min-w-[180px] items-center justify-center px-5 py-4 text-sm font-semibold shadow-neon [transform-style:preserve-3d]"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="projects"
        className="section-shell"
      >
        <div className="container-shell">
          <SectionHeading
            eyebrow="Selected Work"
            title="Projects that show implementation range and product thinking"
            description="This section is powered by markdown articles in the `project` category, so new project entries can be shipped without touching the homepage code."
          />
          {latestPostsQuery.isLoading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-[360px]"
                />
              ))}
            </div>
          ) : latestPostsQuery.isError ? (
            <ErrorState message={latestPostsQuery.error.message} />
          ) : projectPosts.length ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {projectPosts.map((project, index) => (
                <motion.article
                  key={project.path}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -8 }}
                  className="glass-card group overflow-hidden"
                >
                  <div className="relative h-52 overflow-hidden">
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-hero-radial" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--image-fade)] via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="theme-accent-chip rounded-full px-3 py-1 text-xs font-medium">project</span>
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="theme-chip rounded-full px-3 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="theme-title font-display text-2xl">{project.title}</h3>
                    <p className="theme-muted mt-3 text-sm leading-7">
                      {project.description || 'Open the article to review the project details, implementation notes, and outcomes.'}
                    </p>
                    <div className="mt-6 flex gap-3">
                      <Link
                        to={`/blog/${project.category}/${project.slug}`}
                        className="button-primary flex-1 justify-between"
                      >
                        <span>View Project</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/blog/project"
                        className="button-secondary flex-1 justify-between"
                      >
                        <span>All Projects</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="glass-card theme-muted p-8 text-center">
              No `project` articles found yet. Add markdown files under the `project/` category and they will appear here automatically.
            </div>
          )}
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Recent Writing"
            title="Technical notes and blog posts pulled directly from GitHub"
            description="Recent articles provide another signal for communication clarity, documentation habits, and technical depth."
          />
          <ErrorBoundary fallback={<ErrorState title="Latest posts failed to load" />}>
            {latestPostsQuery.isLoading ? (
              <div className="grid gap-6 lg:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-[360px]"
                  />
                ))}
              </div>
            ) : latestPostsQuery.isError ? (
              <ErrorState message={latestPostsQuery.error.message} />
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {latestPosts.map((article, index) => (
                  <ArticleCard
                    key={article.path}
                    article={article}
                    index={index}
                  />
                ))}
              </div>
            )}
          </ErrorBoundary>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Contact"
            title="Professional links for hiring conversations"
            description="Use these to review source code, check LinkedIn, or reach out directly."
          />
          <div className="glass-card flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="theme-title font-display text-2xl">Everything here is organized for a fast recruiter or hiring-manager review.</h3>
              <p className="theme-muted mt-3 max-w-2xl text-sm leading-7">
                GitHub covers code visibility, LinkedIn provides the professional profile, and email is the fastest path for direct outreach.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {SITE_PROFILE.socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-panel theme-title flex min-h-11 items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium transition hover:scale-[1.02] hover:border-neon-cyan/40 hover:shadow-neon"
                  >
                    <Icon className="h-4 w-4" />
                    {social.label}
                  </a>
                );
              })}
              <a
                href={`mailto:${SITE_PROFILE.email}`}
                className="glass-panel theme-title flex min-h-11 items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium transition hover:scale-[1.02] hover:border-neon-cyan/40 hover:shadow-neon"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
