import { motion } from 'framer-motion';
import { CalendarDays, Clock3, Folder, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { safeFormatDate } from '../lib/utils';

export function ArticleCard({ article, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="glass-card group flex h-full flex-col overflow-hidden"
    >
      {article.coverImage ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-40 bg-hero-radial" />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="theme-soft mb-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {safeFormatDate(article.date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {article.readingTime} min
          </span>
        </div>

        <Link
          to={`/blog/${article.category}/${article.slug}`}
          className="theme-title font-display text-xl transition group-hover:text-neon-cyan"
        >
          {article.title}
        </Link>

        <p className="theme-muted mt-3 flex-1 text-sm leading-7">{article.description || 'No description available yet.'}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="theme-accent-chip inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
            <Folder className="h-3 w-3" />
            {article.category}
          </span>
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="theme-chip inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
