import matter from 'gray-matter';
import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';

export const DEFAULT_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main';
export const ITEMS_PER_PAGE = 6;

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTags(tags = []) {
  return tags
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .map((tag) => tag.toLowerCase());
}

export function parseCommitMeta(message = '') {
  const tagMatch = message.match(/tags:\[([^\]]*)\]/);
  const desMatch = message.match(/des:'([^']*)'/);
  const tags = tagMatch
    ? tagMatch[1]
        .split(',')
        .map((tag) => tag.trim().replace(/['"]/g, ''))
        .filter(Boolean)
    : [];
  const description = desMatch ? desMatch[1] : '';
  return {
    tags,
    description
  };
}

export function decodeBase64Unicode(content = '') {
  const binary = window.atob(content.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function parseMarkdownFile(raw = '') {
  const { data, content } = matter(raw);
  return {
    frontmatter: {
      title: data.title || '',
      date: data.date || '',
      description: data.description || '',
      coverImage: data.coverImage || ''
    },
    body: content.trim()
  };
}

export function safeFormatDate(dateValue) {
  if (!dateValue) return 'Undated';
  const parsed = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  if (!isValid(parsed)) return 'Undated';
  return format(parsed, 'MMM d, yyyy');
}

export function relativeDate(dateValue) {
  if (!dateValue) return '';
  const parsed = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  if (!isValid(parsed)) return '';
  return formatDistanceToNowStrict(parsed, { addSuffix: true });
}

export function getReadingTime(text = '') {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function extractTableOfContents(markdown = '') {
  return markdown
    .split('\n')
    .filter((line) => /^##\s+/.test(line))
    .map((line) => {
      const text = line.replace(/^##\s+/, '').trim();
      return {
        id: slugify(text),
        text
      };
    });
}

export function recencyBoost(dateValue) {
  if (!dateValue) return 0;
  const parsed = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  if (!isValid(parsed)) return 0;
  const msIn30Days = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - parsed.getTime() < msIn30Days ? 1 : 0;
}

export function scoreRecommendation(currentArticle, candidate) {
  if (!currentArticle || !candidate || currentArticle.path === candidate.path) {
    return -1;
  }
  const currentTags = new Set(normalizeTags(currentArticle.tags));
  const sharedTags = normalizeTags(candidate.tags).filter((tag) => currentTags.has(tag));
  return sharedTags.length * 3 + (currentArticle.category === candidate.category ? 2 : 0) + recencyBoost(candidate.date);
}

export function getRecommendations(currentArticle, articles = []) {
  return articles
    .map((candidate) => ({
      article: candidate,
      score: scoreRecommendation(currentArticle, candidate)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.article.date) - new Date(a.article.date))
    .slice(0, 3)
    .map((entry) => entry.article);
}
