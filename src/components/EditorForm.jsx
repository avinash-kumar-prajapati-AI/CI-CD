import { useEffect, useMemo, useState } from 'react';
import { markdown } from '@codemirror/lang-markdown';
import CodeMirror from '@uiw/react-codemirror';
import { Eye, FilePenLine, Save } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TagInput } from './TagInput';
import { slugify } from '../lib/utils';
import { useThemeStore } from '../store/themeStore';

const defaultBody = `## Start writing\n\nWrite in markdown and preview changes live.\n`;

export function EditorForm({
  mode,
  initialArticle,
  categories,
  submitting,
  onSubmit
}) {
  const { theme } = useThemeStore();
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [category, setCategory] = useState(initialArticle?.category || categories[0] || '');
  const [description, setDescription] = useState(initialArticle?.description || '');
  const [coverImage, setCoverImage] = useState(initialArticle?.coverImage || '');
  const [date, setDate] = useState(initialArticle?.date || new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState(initialArticle?.tags || []);
  const [body, setBody] = useState(initialArticle?.body || defaultBody);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialArticle?.slug));

  useEffect(() => {
    if (initialArticle) {
      setTitle(initialArticle.title || '');
      setSlug(initialArticle.slug || '');
      setCategory(initialArticle.category || categories[0] || '');
      setDescription(initialArticle.description || '');
      setCoverImage(initialArticle.coverImage || '');
      setDate(initialArticle.date || new Date().toISOString().slice(0, 10));
      setTags(initialArticle.tags || []);
      setBody(initialArticle.body || defaultBody);
      setSlugTouched(true);
    }
  }, [categories, initialArticle]);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [slugTouched, title]);

  const canSubmit = useMemo(() => title && category && slug && body, [body, category, slug, title]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      title,
      slug,
      category,
      description,
      coverImage,
      date,
      tags,
      body
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <FilePenLine className="h-5 w-5 text-neon-cyan" />
            <div>
              <h2 className="theme-title font-display text-2xl">{mode === 'edit' ? 'Edit article' : 'Create article'}</h2>
              <p className="theme-muted text-sm">Markdown content is committed directly into your GitHub repo.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="theme-muted space-y-2 text-sm md:col-span-2">
              <span>Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="input-shell"
                placeholder="Article title"
              />
            </label>

            <label className="theme-muted space-y-2 text-sm">
              <span>Slug</span>
              <input
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                className="input-shell"
                placeholder="article-slug"
              />
            </label>

            <label className="theme-muted space-y-2 text-sm">
              <span>Date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="input-shell"
              />
            </label>

            <label className="theme-muted space-y-2 text-sm">
              <span>Category</span>
              <input
                list="categories"
                value={category}
                onChange={(event) => setCategory(slugify(event.target.value))}
                className="input-shell"
                placeholder="engineering"
              />
              <datalist id="categories">
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  />
                ))}
              </datalist>
            </label>

            <label className="theme-muted space-y-2 text-sm">
              <span>Cover image URL</span>
              <input
                value={coverImage}
                onChange={(event) => setCoverImage(event.target.value)}
                className="input-shell"
                placeholder="https://..."
              />
            </label>

            <label className="theme-muted space-y-2 text-sm md:col-span-2">
              <span>Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="input-shell"
                placeholder="Short summary shown in cards and commit metadata"
              />
            </label>

            <div className="space-y-2 md:col-span-2">
              <span className="theme-muted text-sm">Tags</span>
              <TagInput
                tags={tags}
                onChange={setTags}
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <Eye className="h-5 w-5 text-neon-cyan" />
            <div>
              <h3 className="theme-title font-display text-xl">Frontmatter preview</h3>
              <p className="theme-muted text-sm">Keep metadata clean so cards and search stay sharp.</p>
            </div>
          </div>
          <div className="theme-elevated rounded-2xl border p-4 text-sm">
            <p>/{category || 'category'}/{slug || 'article'}.md</p>
            <p className="mt-3 text-neon-cyan">tags:[{tags.map((tag) => `'${tag}'`).join(',')}] | des:'{description}'</p>
          </div>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="button-primary mt-6 w-full justify-between"
          >
            <span>{submitting ? 'Saving...' : mode === 'edit' ? 'Update article' : 'Publish article'}</span>
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card overflow-hidden p-2">
          <CodeMirror
            value={body}
            extensions={[markdown()]}
            height="540px"
            theme={theme}
            onChange={setBody}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true
            }}
          />
        </div>

        <div className="glass-card max-h-[540px] overflow-y-auto p-6">
          <MarkdownRenderer content={body} />
        </div>
      </div>
    </form>
  );
}
