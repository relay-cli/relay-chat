import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {createConversation, createMessage} from '../src/model/index.js';
import {
  conversationToHtml,
  conversationToMarkdown,
  conversationToText,
  exportConversation,
  enableAutosave,
  loadConversation,
  saveConversation,
} from '../src/persistence/index.js';
import {ChatStore} from '../src/store/index.js';

const directories: string[] = [];
afterEach(async () =>
  Promise.all(directories.splice(0).map((path) => rm(path, {recursive: true, force: true}))),
);

describe('conversation persistence', () => {
  it('round-trips conversation JSON through an atomic save', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'relay-chat-'));
    directories.push(directory);
    const path = join(directory, 'nested', 'chat.json');
    const conversation = {
      ...createConversation({id: 'c1', title: 'Test'}),
      messages: [createMessage('user', 'hello', {id: 'm1'})],
    };
    await saveConversation(path, conversation);
    expect(await loadConversation(path)).toEqual(conversation);
    expect((await readFile(path, 'utf8')).endsWith('\n')).toBe(true);
  });

  it('writes a waiting autosave when autosave stops', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'relay-chat-'));
    directories.push(directory);
    const path = join(directory, 'chat.json');
    const store = new ChatStore(createConversation({id: 'c1', title: 'Test'}));
    const stop = enableAutosave(store, path, {delayMs: 60_000});
    store.setTitle('Renamed');
    await stop();
    expect((await loadConversation(path)).title).toBe('Renamed');
  });

  it('exports readable Markdown', () => {
    const conversation = {
      ...createConversation({id: 'c1', title: 'Test'}),
      messages: [createMessage('user', 'hello', {id: 'm1'})],
    };
    expect(conversationToMarkdown(conversation)).toContain('# Test\n\n## You\n\nhello');
  });

  it('exports plain text and escaped HTML by file extension', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'relay-chat-'));
    directories.push(directory);
    const conversation = {
      ...createConversation({id: 'c1', title: 'Tags <b>'}),
      messages: [
        createMessage('user', 'is 1 < 2?', {id: 'm1'}),
        createMessage('assistant', 'yes', {id: 'm2', model: 'local'}),
      ],
    };
    expect(conversationToText(conversation)).toBe(
      'Tags <b>\n========\n\nYou:\nis 1 < 2?\n\nlocal:\nyes\n',
    );
    const html = conversationToHtml(conversation);
    expect(html).toContain('<title>Tags &lt;b&gt;</title>');
    expect(html).toContain('<pre>is 1 &lt; 2?</pre>');
    expect(html).not.toContain('<b>');

    await exportConversation(join(directory, 'chat.txt'), conversation);
    await exportConversation(join(directory, 'chat.html'), conversation);
    await exportConversation(join(directory, 'chat.md'), conversation);
    expect(await readFile(join(directory, 'chat.txt'), 'utf8')).toBe(
      conversationToText(conversation),
    );
    expect(await readFile(join(directory, 'chat.html'), 'utf8')).toBe(html);
    expect(await readFile(join(directory, 'chat.md'), 'utf8')).toBe(
      conversationToMarkdown(conversation),
    );
  });
});
