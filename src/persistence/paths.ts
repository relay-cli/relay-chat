import {resolve} from 'node:path';

export const safeFilename = (title: string): string => {
  const normalized = title
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .toLowerCase();
  return normalized.slice(0, 64) || 'conversation';
};

export const defaultConversationPath = (title: string, cwd = process.cwd()): string =>
  resolve(cwd, 'conversations', `${safeFilename(title)}.json`);

export const defaultExportPath = (title: string, cwd = process.cwd()): string =>
  resolve(cwd, 'conversations', `${safeFilename(title)}.md`);
