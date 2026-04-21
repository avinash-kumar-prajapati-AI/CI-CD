import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugify } from '../lib/utils';

export function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="markdown-body"
      components={{
        h2: ({ children }) => {
          const text = Array.isArray(children) ? children.join('') : String(children);
          return (
            <h2 id={slugify(text)}>
              {children}
            </h2>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
