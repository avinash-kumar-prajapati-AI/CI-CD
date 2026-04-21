import { slugify } from '../lib/utils';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createCategory, deleteArticle, getAllArticles, getArticleByPath, listCategories, saveArticle } from '../lib/github';
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

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (category) => {
      toast.success(`Category ${category} created`);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: (error) => {
      toast.error(error.message || 'Could not create category');
    }
  });
}

export function useSaveArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveArticle,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.articles });
      const previousArticles = queryClient.getQueryData(queryKeys.articles);

      if (previousArticles) {
        const optimisticPath = `${slugify(variables.category)}/${slugify(variables.slug || variables.title)}.md`;
        queryClient.setQueryData(queryKeys.articles, (current = []) => {
          const normalized = current.filter((item) => item.path !== variables.originalPath);
          return [
            {
              ...variables,
              path: optimisticPath,
              category: slugify(variables.category),
              slug: slugify(variables.slug || variables.title),
              tags: variables.tags,
              readingTime: 1,
              tableOfContents: [],
              authorAvatar: `https://github.com/${import.meta.env.VITE_GITHUB_OWNER || 'github'}.png`
            },
            ...normalized
          ].sort((a, b) => new Date(b.date) - new Date(a.date));
        });
      }

      return { previousArticles };
    },
    onError: (error, _variables, context) => {
      if (context?.previousArticles) {
        queryClient.setQueryData(queryKeys.articles, context.previousArticles);
      }
      toast.error(error.message || 'Could not save article');
    },
    onSuccess: (article) => {
      toast.success('Article saved');
      queryClient.setQueryData(queryKeys.article(article.path), article);
      queryClient.invalidateQueries({ queryKey: queryKeys.articles });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    }
  });
}

export function useDeleteArticleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteArticle,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.articles });
      const previousArticles = queryClient.getQueryData(queryKeys.articles);
      queryClient.setQueryData(queryKeys.articles, (current = []) =>
        current.filter((article) => article.path !== variables.path)
      );
      return { previousArticles };
    },
    onError: (error, _variables, context) => {
      if (context?.previousArticles) {
        queryClient.setQueryData(queryKeys.articles, context.previousArticles);
      }
      toast.error(error.message || 'Could not delete article');
    },
    onSuccess: (_data, variables) => {
      toast.success('Article deleted');
      queryClient.removeQueries({ queryKey: queryKeys.article(variables.path) });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles });
    }
  });
}
