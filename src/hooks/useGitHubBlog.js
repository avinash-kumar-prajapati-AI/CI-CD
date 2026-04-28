import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getAllArticles, getArticleByPath, listCategories } from '../lib/github';
import { ITEMS_PER_PAGE } from '../lib/utils';

export const queryKeys = {
  categories: ['categories'],
  articles: ['articles'],
  article: (path) => ['article', path]
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: listCategories,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 20
  });
}

export function useAllArticlesQuery() {
  return useQuery({
    queryKey: queryKeys.articles,
    queryFn: getAllArticles,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 30
  });
}

export function useArticleQuery(path) {
  return useQuery({
    queryKey: queryKeys.article(path),
    queryFn: () => getArticleByPath(path),
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 20
  });
}

export function useArticlesFeed(filter = {}) {
  const allArticles = useAllArticlesQuery();

  return useInfiniteQuery({
    queryKey: ['articles-feed', filter, allArticles.dataUpdatedAt],
    enabled: Boolean(allArticles.data),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const data = filterArticles(allArticles.data || [], filter);
      const start = pageParam * ITEMS_PER_PAGE;
      return {
        items: data.slice(start, start + ITEMS_PER_PAGE),
        nextPage: start + ITEMS_PER_PAGE < data.length ? pageParam + 1 : undefined,
        total: data.length
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage
  });
}

function filterArticles(articles, filter) {
  return articles.filter((article) => {
    const matchesCategory = filter.category ? article.category === filter.category : true;
    const matchesTag = filter.tag ? article.tags.includes(filter.tag) : true;
    return matchesCategory && matchesTag;
  });
}
