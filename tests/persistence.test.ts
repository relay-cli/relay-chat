import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {createConversation, createMessage} from '../src/model/index.js';
import {conversationToMarkdown, loadConversation, saveConversation} from '../src/persistence/index.js';

const directories: string[] = [];
afterEach(async () => Promise.all(directories.splice(0).map((path) => rm(path, {recursive: true, force: true}))));

describe('conversation persistence', () => {
  it('round-trips conversation JSON through an atomic save', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'relay-chat-'));
    directories.push(directory);
    const path = join(directory, 'nested', 'chat.json');
    const conversation = {...createConversation({id: 'c1', title: 'Test'}), messages: [createMessage('user', 'hello', {id: 'm1'})]};
    await saveConversation(path, conversation);
    expect(await loadConversation(path)).toEqual(conversation);
    expect((await readFile(path, 'utf8')).endsWith('\n')).toBe(true);
  });

  it('exports readable Markdown', () => {
    const conversation = {...createConversation({id: 'c1', title: 'Test'}), messages: [createMessage('user', 'hello', {id: 'm1'})]};
    expect(conversationToMarkdown(conversation)).toContain('# Test\n\n## You\n\nhello');
  });
});
