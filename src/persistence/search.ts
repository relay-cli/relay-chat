import {readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {loadConversation} from './file-store.js';

export interface ConversationSearchResult {
  path: string;
  title: string;
  matches: number;
  excerpt: string;
}

const excerptAround = (content: string, index: number, length: number): string => {
  const start = Math.max(0, index - 30);
  const end = Math.min(content.length, index + length + 30);
  const text = content.slice(start, end).replace(/\s+/g, ' ').trim();
  return `${start > 0 ? '…' : ''}${text}${end < content.length ? '…' : ''}`;
};

export const searchConversations = async (
  directory: string,
  query: string,
): Promise<ConversationSearchResult[]> => {
  const needle = query.trim().toLowerCase();
  if (needle === '') return [];
  let names: string[];
  try {
    names = await readdir(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const results: ConversationSearchResult[] = [];
  for (const name of names.filter((candidate) => candidate.endsWith('.json')).sort()) {
    const path = join(directory, name);
    let conversation;
    try {
      conversation = await loadConversation(path);
    } catch {
      continue;
    }
    let matches = 0;
    let excerpt = '';
    for (const text of [conversation.title, ...conversation.messages.map(({content}) => content)]) {
      const lower = text.toLowerCase();
      let index = lower.indexOf(needle);
      if (index !== -1 && excerpt === '') excerpt = excerptAround(text, index, needle.length);
      while (index !== -1) {
        matches += 1;
        index = lower.indexOf(needle, index + needle.length);
      }
    }
    if (matches > 0) results.push({path, title: conversation.title, matches, excerpt});
  }
  return results.sort((left, right) => right.matches - left.matches);
};
