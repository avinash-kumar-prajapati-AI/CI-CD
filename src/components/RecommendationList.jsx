import { ArticleCard } from './ArticleCard';

export function RecommendationList({ articles }) {
  if (!articles.length) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {articles.map((article, index) => (
        <ArticleCard
          key={article.path}
          article={article}
          index={index}
        />
      ))}
    </div>
  );
}
