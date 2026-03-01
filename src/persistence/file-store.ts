import {mkdir, readFile, rename, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import type {Conversation} from '../model/index.js';
import {parseConversation, serializeConversation} from './json.js';

export const loadConversation = async (path: string): Promise<Conversation> =>
  parseConversation(await readFile(path, 'utf8'));

export const saveConversation = async (path: string, conversation: Conversation): Promise<void> => {
  await mkdir(dirname(path), {recursive: true});
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, serializeConversation(conversation), {encoding: 'utf8', mode: 0o600});
  await rename(temporary, path);
};
