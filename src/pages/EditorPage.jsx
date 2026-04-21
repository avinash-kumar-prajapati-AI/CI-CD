import { useNavigate, useParams } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { EditorForm } from '../components/EditorForm';
import { ErrorState } from '../components/ErrorState';
import { SectionHeading } from '../components/SectionHeading';
import { Skeleton } from '../components/Skeleton';
import { useArticleQuery, useCategoriesQuery, useSaveArticleMutation } from '../hooks/useGitHubBlog';

export function EditorPage({ mode }) {
  const navigate = useNavigate();
  const { category, slug } = useParams();
  const categoriesQuery = useCategoriesQuery();
  const saveMutation = useSaveArticleMutation();
  const originalPath = mode === 'edit' ? `${category}/${slug}.md` : undefined;
  const articleQuery = useArticleQuery(originalPath);

  async function handleSubmit(payload) {
    const article = await saveMutation.mutateAsync({
      ...payload,
      currentSha: articleQuery.data?.sha,
      originalPath
    });
    navigate(`/blog/${article.category}/${article.slug}`);
  }

  const isLoading = categoriesQuery.isLoading || (mode === 'edit' && articleQuery.isLoading);
  const isError = categoriesQuery.isError || (mode === 'edit' && articleQuery.isError);
  const errorMessage = categoriesQuery.error?.message || articleQuery.error?.message;

  return (
    <div className="container-shell section-shell">
      <SectionHeading
        eyebrow="Admin Editor"
        title={mode === 'edit' ? 'Refine an existing post' : 'Publish a new markdown article'}
        description="The editor writes frontmatter and markdown directly into the GitHub repository defined by your environment variables."
      />

      <ErrorBoundary fallback={<ErrorState title="Editor failed to render" />}>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-[280px]" />
            <Skeleton className="h-[540px]" />
          </div>
        ) : isError ? (
          <ErrorState message={errorMessage} />
        ) : (
          <EditorForm
            mode={mode}
            initialArticle={articleQuery.data}
            categories={categoriesQuery.data || []}
            submitting={saveMutation.isPending}
            onSubmit={handleSubmit}
          />
        )}
      </ErrorBoundary>
    </div>
  );
}
