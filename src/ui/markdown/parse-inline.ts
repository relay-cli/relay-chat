import type {InlineToken} from './types.js';

const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

export const parseInline = (source: string): readonly InlineToken[] => {
  const tokens: InlineToken[] = [];
  let cursor = 0;
  for (const match of source.matchAll(tokenPattern)) {
    const index = match.index;
    if (index > cursor) tokens.push({type: 'text', value: source.slice(cursor, index)});
    const value = match[0];
    if (value.startsWith('**')) tokens.push({type: 'strong', value: value.slice(2, -2)});
    else if (value.startsWith('`')) tokens.push({type: 'code', value: value.slice(1, -1)});
    else if (value.startsWith('*')) tokens.push({type: 'emphasis', value: value.slice(1, -1)});
    else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(value);
      tokens.push({type: 'link', value: link?.[1] ?? value, href: link?.[2] ?? ''});
    }
    cursor = index + value.length;
  }
  if (cursor < source.length) tokens.push({type: 'text', value: source.slice(cursor)});
  return tokens;
};
