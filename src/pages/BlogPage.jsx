import { useMemo, useState } from 'react';
import { Filter, LoaderCircle, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ArticleCard } from '../components/ArticleCard';
import { CategorySidebar } from '../components/CategorySidebar';
import { ErrorState } from '../components/ErrorState';
import { SectionHeading } from '../components/SectionHeading';
import { Skeleton } from '../components/Skeleton';
import { useAllArticlesQuery, useArticlesFeed, useCategoriesQuery, useCreateCategoryMutation } from '../hooks/useGitHubBlog';
import { useAuthStore } from '../store/authStore';

export function BlogPage() {
  const [activeTag, setActiveTag] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { isAdmin } = useAuthStore();
  const categoriesQuery = useCategoriesQuery();
  const articlesQuery = useAllArticlesQuery();
  const createCategoryMutation = useCreateCategoryMutation();

  const tags = useMemo(() => {
    const unique = new Set();
    (articlesQuery.data || []).forEach((article) => article.tags.forEach((tag) => unique.add(tag)));
    return Array.from(unique).sort();
  }, [articlesQuery.data]);

  const feedQuery = useArticlesFeed({ tag: activeTag });
  const feedItems = feedQuery.data?.pages.flatMap((page) => page.items) || [];
  const hasMore = Boolean(feedQuery.hasNextPage);

  function handleCreateCategory() {
    const value = window.prompt('Enter the new category folder name');
    if (value) {
      createCategoryMutation.mutate(value);
    }
  }

  return (
    <div className="container-shell section-shell">
      <SectionHeading
        eyebrow="Blog"
        title="Browse every article in the repo"
        description="Filter by category and commit-derived tags, then load more posts without leaving the page."
      />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <ErrorBoundary fallback={<ErrorState title="Categories failed to render" />}>
          {categoriesQuery.isLoading ? (
            <Skeleton className="h-[320px]" />
          ) : categoriesQuery.isError ? (
            <ErrorState message={categoriesQuery.error.message} />
          ) : (
            <CategorySidebar
              categories={categoriesQuery.data}
              onCreateCategory={handleCreateCategory}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((value) => !value)}
            />
          )}
        </ErrorBoundary>

        <div className="space-y-6">
          <div className="glass-card flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Filter className="theme-accent h-4 w-4" />
                <span className="theme-title font-medium">Filter by tag</span>
              </div>
              {isAdmin ? (
                <Link
                  to="/blog/new"
                  className="button-primary justify-between sm:w-auto"
                >
                  <span>New article</span>
                  <PlusCircle className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTag('')}
                className={`rounded-full px-4 py-2 text-sm transition ${!activeTag ? 'theme-accent-chip' : 'theme-chip hover:bg-[var(--panel-hover-bg)]'}`}
              >
                All tags
              </button>
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full px-4 py-2 text-sm transition ${activeTag === tag ? 'theme-accent-chip' : 'theme-chip hover:bg-[var(--panel-hover-bg)]'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <ErrorBoundary fallback={<ErrorState title="Articles failed to render" />}>
            {articlesQuery.isLoading || feedQuery.isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-[360px]"
                  />
                ))}
              </div>
            ) : articlesQuery.isError || feedQuery.isError ? (
              <ErrorState message={articlesQuery.error?.message || feedQuery.error?.message} />
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {feedItems.map((article, index) => (
                    <ArticleCard
                      key={article.path}
                      article={article}
                      index={index}
                    />
                  ))}
                </div>
                {!feedItems.length ? (
                  <div className="glass-card theme-muted p-8 text-center">No articles matched this tag yet.</div>
                ) : null}
                {hasMore ? (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => feedQuery.fetchNextPage()}
                      className="button-secondary min-w-44 justify-center"
                    >
                      {feedQuery.isFetchingNextPage ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load more'
                      )}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
