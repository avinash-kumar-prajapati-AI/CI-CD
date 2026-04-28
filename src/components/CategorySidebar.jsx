import { Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CategorySidebar({ categories = [], activeCategory, collapsed = false, onToggle }) {
  return (
    <aside className="glass-card h-fit p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers3 className="theme-accent h-4 w-4" />
          <h3 className="theme-title font-display text-lg">Categories</h3>
        </div>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className="button-secondary px-3 py-2 text-xs md:hidden"
          >
            {collapsed ? 'Show' : 'Hide'}
          </button>
        ) : null}
      </div>

      <div className={collapsed ? 'hidden md:block' : 'block'}>
        <div className="flex flex-col gap-2">
          <Link
            to="/blog"
            className={`rounded-2xl px-4 py-3 text-sm transition ${!activeCategory ? 'bg-[var(--panel-hover-bg)] text-[var(--text-primary)]' : 'theme-muted hover:bg-[var(--panel-hover-bg)]'}`}
          >
            All posts
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              to={`/blog/${category}`}
              className={`rounded-2xl px-4 py-3 text-sm transition ${
                activeCategory === category ? 'theme-accent-chip' : 'theme-muted hover:bg-[var(--panel-hover-bg)]'
              }`}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
