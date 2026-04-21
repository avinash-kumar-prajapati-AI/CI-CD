import { useEffect, useMemo, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorState } from '../components/ErrorState';
import { SectionHeading } from '../components/SectionHeading';
import { Skeleton } from '../components/Skeleton';
import { useAllArticlesQuery } from '../hooks/useGitHubBlog';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { createArticleFuse } from '../lib/search';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const articlesQuery = useAllArticlesQuery();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedQuery) {
      next.set('q', debouncedQuery);
    }
    setSearchParams(next, { replace: true });
  }, [debouncedQuery, setSearchParams]);

  const results = useMemo(() => {
    if (!debouncedQuery) {
      return articlesQuery.data || [];
    }
    const fuse = createArticleFuse(articlesQuery.data || []);
    return fuse.search(debouncedQuery).map((entry) => entry.item);
  }, [articlesQuery.data, debouncedQuery]);

  return (
    <div className="container-shell section-shell">
      <SectionHeading
        eyebrow="Search"
        title="Fuzzy search across titles, descriptions, tags, and categories"
        description="Results are URL-synced through `?q=` so every search state stays shareable."
      />

      <div className="glass-card mb-8 flex items-center gap-3 p-4 sm:p-5">
        <SearchIcon className="theme-accent h-5 w-5" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles, tags, or categories..."
          className="theme-title w-full bg-transparent text-base outline-none placeholder:text-[var(--text-soft)]"
        />
      </div>

      <ErrorBoundary fallback={<ErrorState title="Search failed to render" />}>
        {articlesQuery.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Skeleton
                key={index}
                className="h-[360px]"
              />
            ))}
          </div>
        ) : articlesQuery.isError ? (
          <ErrorState message={articlesQuery.error.message} />
        ) : results.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((article, index) => (
              <ArticleCard
                key={article.path}
                article={article}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6 h-28 w-28">
              <div className="absolute inset-0 animate-pulse rounded-full theme-accent-chip" />
              <div className="absolute inset-4 rounded-full theme-accent-secondary-chip" />
              <div className="absolute inset-8 rounded-full border border-[var(--glass-border)] bg-[var(--chip-bg)]" />
            </div>
            <h3 className="theme-title font-display text-2xl">No results yet</h3>
            <p className="theme-muted mt-3 max-w-md text-sm leading-7">
              Try a broader keyword or tag. Search is powered by Fuse.js over the cached article dataset.
            </p>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
