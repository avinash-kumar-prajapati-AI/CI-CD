import { useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { CategorySidebar } from '../components/CategorySidebar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorState } from '../components/ErrorState';
import { SectionHeading } from '../components/SectionHeading';
import { Skeleton } from '../components/Skeleton';
import { useAllArticlesQuery, useArticlesFeed, useCategoriesQuery } from '../hooks/useGitHubBlog';

export function CategoryPage() {
  const { category } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const categoriesQuery = useCategoriesQuery();
  const articlesQuery = useAllArticlesQuery();
  const feedQuery = useArticlesFeed({ category });
  const categoryArticles = feedQuery.data?.pages.flatMap((page) => page.items) || [];

  const categoryTags = useMemo(() => {
    const unique = new Set();
    (articlesQuery.data || [])
      .filter((article) => article.category === category)
      .forEach((article) => article.tags.forEach((tag) => unique.add(tag)));
    return Array.from(unique).sort();
  }, [articlesQuery.data, category]);

  return (
    <div className="container-shell section-shell">
      <SectionHeading
        eyebrow="Category"
        title={`Posts in ${category}`}
        description={`Browsing the ${category} folder directly from your GitHub storage repo.`}
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
              activeCategory={category}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((value) => !value)}
            />
          )}
        </ErrorBoundary>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <p className="theme-muted text-sm">
              Tags in this category: {categoryTags.length ? categoryTags.join(', ') : 'No tags yet'}
            </p>
          </div>

          <ErrorBoundary fallback={<ErrorState title="Category feed failed to render" />}>
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
                  {categoryArticles.map((article, index) => (
                    <ArticleCard
                      key={article.path}
                      article={article}
                      index={index}
                    />
                  ))}
                </div>
                {!categoryArticles.length ? (
                  <div className="glass-card theme-muted p-8 text-center">No markdown articles were found in this category.</div>
                ) : null}
                {feedQuery.hasNextPage ? (
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
