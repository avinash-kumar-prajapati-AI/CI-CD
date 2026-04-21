import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, FilePenLine, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { RecommendationList } from '../components/RecommendationList';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorState } from '../components/ErrorState';
import { SectionHeading } from '../components/SectionHeading';
import { Skeleton } from '../components/Skeleton';
import { useAllArticlesQuery, useArticleQuery, useDeleteArticleMutation } from '../hooks/useGitHubBlog';
import { getRecommendations, safeFormatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export function ArticlePage() {
  const navigate = useNavigate();
  const { category, slug } = useParams();
  const path = `${category}/${slug}.md`;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { isAdmin } = useAuthStore();
  const articleQuery = useArticleQuery(path);
  const allArticlesQuery = useAllArticlesQuery();
  const deleteMutation = useDeleteArticleMutation();

  const recommendations = useMemo(
    () => getRecommendations(articleQuery.data, allArticlesQuery.data || []),
    [allArticlesQuery.data, articleQuery.data]
  );

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync({
        path,
        sha: articleQuery.data?.sha
      });
      navigate('/blog');
    } finally {
      setDeleteOpen(false);
    }
  }

  return (
    <div className="container-shell section-shell">
      <ErrorBoundary fallback={<ErrorState title="Article failed to render" />}>
        {articleQuery.isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 max-w-lg" />
            <Skeleton className="h-[500px]" />
          </div>
        ) : articleQuery.isError ? (
          <ErrorState message={articleQuery.error.message} />
        ) : (
          <>
            <article className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="min-w-0">
                <div className="glass-card p-6 sm:p-8">
                  <div className="theme-soft mb-5 flex flex-wrap items-center gap-3 text-sm">
                    <span className="theme-accent-chip rounded-full px-3 py-1">
                      {articleQuery.data.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {safeFormatDate(articleQuery.data.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {articleQuery.data.readingTime} min read
                    </span>
                  </div>

                  <h1 className="theme-title font-display text-4xl font-bold sm:text-5xl">{articleQuery.data.title}</h1>
                  <p className="theme-muted mt-5 max-w-3xl text-base leading-8">{articleQuery.data.description}</p>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={articleQuery.data.authorAvatar}
                        alt="Author avatar"
                        className="h-11 w-11 rounded-full border border-[var(--glass-border)] object-cover"
                      />
                      <div>
                        <p className="theme-title text-sm">Repository author</p>
                        <p className="theme-soft text-xs">@{import.meta.env.VITE_GITHUB_OWNER || 'github-user'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {articleQuery.data.tags.map((tag) => (
                        <span
                          key={tag}
                          className="theme-chip rounded-full px-3 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isAdmin ? (
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link
                        to={`/blog/${category}/${slug}/edit`}
                        className="button-secondary justify-between sm:w-auto"
                      >
                        <span>Edit article</span>
                        <FilePenLine className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteOpen(true)}
                        className="button-danger sm:w-auto"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </span>
                      </button>
                    </div>
                  ) : null}

                  {articleQuery.data.coverImage ? (
                    <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--glass-border)]">
                      <img
                        src={articleQuery.data.coverImage}
                        alt={articleQuery.data.title}
                        className="h-full max-h-[420px] w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="mt-10">
                    <MarkdownRenderer content={articleQuery.data.body} />
                  </div>
                </div>

                <section className="mt-10">
                  <SectionHeading
                    eyebrow="You Might Also Like"
                    title="Related reads"
                    description="Recommendations are scored by shared tags, category match, and a small recency boost."
                  />
                  <RecommendationList articles={recommendations} />
                </section>
              </div>

              <aside className="space-y-6">
                <div className="glass-card sticky top-28 p-5">
                  <h2 className="theme-title font-display text-xl">Table of contents</h2>
                  <nav className="mt-4 flex flex-col gap-2 text-sm">
                    {articleQuery.data.tableOfContents.length ? (
                      articleQuery.data.tableOfContents.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className="theme-muted rounded-xl px-3 py-2 transition hover:bg-[var(--panel-hover-bg)] hover:text-[var(--accent-primary)]"
                        >
                          {item.text}
                        </a>
                      ))
                    ) : (
                      <p className="theme-soft">Add `## headings` to generate a table of contents.</p>
                    )}
                  </nav>
                </div>
              </aside>
            </article>

            <DeleteConfirmModal
              open={deleteOpen}
              title={articleQuery.data.title}
              loading={deleteMutation.isPending}
              onCancel={() => setDeleteOpen(false)}
              onConfirm={handleDelete}
            />
          </>
        )}
      </ErrorBoundary>
    </div>
  );
}
