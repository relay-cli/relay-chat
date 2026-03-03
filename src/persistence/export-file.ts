import {mkdir, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import type {Conversation} from '../model/index.js';
import {conversationToMarkdown} from './export-markdown.js';

export const exportConversation = async (
  path: string,
  conversation: Conversation,
): Promise<void> => {
  await mkdir(dirname(path), {recursive: true});
  await writeFile(path, conversationToMarkdown(conversation), 'utf8');
};
