import { useState } from 'react';
import { X } from 'lucide-react';

export function TagInput({ tags, onChange }) {
  const [value, setValue] = useState('');

  function addTag(raw) {
    const nextTag = raw.trim().toLowerCase();
    if (!nextTag || tags.includes(nextTag)) {
      return;
    }
    onChange([...tags, nextTag]);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(value);
      setValue('');
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-3">
      <div className="mb-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="theme-accent-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((item) => item !== tag))}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (value.trim()) {
            addTag(value);
            setValue('');
          }
        }}
        placeholder="Add tags and press Enter"
        className="input-shell border-0 bg-transparent px-2 py-2 focus:bg-[var(--panel-hover-bg)]"
      />
    </div>
  );
}
