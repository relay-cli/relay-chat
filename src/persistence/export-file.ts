import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, extname} from 'node:path';
import type {Conversation} from '../model/index.js';
import {conversationToMarkdown} from './export-markdown.js';
import {conversationToHtml, conversationToText} from './export-text.js';

export const exportFormatFor = (path: string): 'markdown' | 'text' | 'html' => {
  const extension = extname(path).toLowerCase();
  if (extension === '.txt') return 'text';
  if (extension === '.html' || extension === '.htm') return 'html';
  return 'markdown';
};

const renderers = {
  markdown: conversationToMarkdown,
  text: conversationToText,
  html: conversationToHtml,
};

export const exportConversation = async (
  path: string,
  conversation: Conversation,
): Promise<void> => {
  await mkdir(dirname(path), {recursive: true});
  await writeFile(path, renderers[exportFormatFor(path)](conversation), 'utf8');
};
