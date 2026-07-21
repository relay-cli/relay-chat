import type {MarkdownBlock} from './types.js';

const headingPattern = /^(#{1,6})\s+(.+)$/;
const unorderedPattern = /^[-*+]\s+(.+)$/;
const orderedPattern = /^\d+[.)]\s+(.+)$/;

export const parseMarkdownBlocks = (source: string): readonly MarkdownBlock[] => {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (line.trim() === '') {
      index += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || undefined;
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? '').startsWith('```')) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({
        type: 'code',
        code: code.join('\n'),
        ...(language === undefined ? {} : {language}),
      });
      continue;
    }
    const heading = headingPattern.exec(line);
    if (heading !== null) {
      blocks.push({type: 'heading', level: heading[1]?.length ?? 1, text: heading[2] ?? ''});
      index += 1;
      continue;
    }
    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push({type: 'rule'});
      index += 1;
      continue;
    }
    if (line.startsWith('> ')) {
      const quote: string[] = [];
      while (index < lines.length && (lines[index] ?? '').startsWith('> ')) {
        quote.push((lines[index] ?? '').slice(2));
        index += 1;
      }
      blocks.push({type: 'quote', text: quote.join('\n')});
      continue;
    }
    const unordered = unorderedPattern.exec(line);
    const ordered = orderedPattern.exec(line);
    if (unordered !== null || ordered !== null) {
      const isOrdered = ordered !== null;
      const pattern = isOrdered ? orderedPattern : unorderedPattern;
      const items: string[] = [];
      while (index < lines.length) {
        const match = pattern.exec(lines[index] ?? '');
        if (match === null) break;
        items.push(match[1] ?? '');
        index += 1;
      }
      blocks.push({type: 'list', ordered: isOrdered, items});
      continue;
    }
    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length) {
      const next = lines[index] ?? '';
      if (
        next.trim() === '' ||
        next.startsWith('```') ||
        headingPattern.test(next) ||
        next.startsWith('> ') ||
        unorderedPattern.test(next) ||
        orderedPattern.test(next)
      ) {
        break;
      }
      paragraph.push(next.trim());
      index += 1;
    }
    blocks.push({type: 'paragraph', text: paragraph.join(' ')});
  }

  return blocks;
};
