import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {executeSlashCommand} from '../src/commands/index.js';
import {createConversation, createMessage} from '../src/model/index.js';
import {saveConversation, searchConversations} from '../src/persistence/index.js';
import {ChatSession} from '../src/session/index.js';
import {ChatStore} from '../src/store/index.js';
import {EchoTransport} from '../src/transport/index.js';

const directories: string[] = [];
afterEach(async () =>
  Promise.all(directories.splice(0).map((path) => rm(path, {recursive: true, force: true}))),
);

const workspace = async (): Promise<string> => {
  const cwd = await mkdtemp(join(tmpdir(), 'relay-chat-'));
  directories.push(cwd);
  const directory = join(cwd, 'conversations');
  await mkdir(directory);
  await saveConversation(join(directory, 'rust.json'), {
    ...createConversation({id: 'c1', title: 'Rust lifetimes'}),
    messages: [
      createMessage('user', 'Explain borrow checking in Rust.', {id: 'm1'}),
      createMessage('assistant', 'The borrow checker tracks references.', {id: 'm2'}),
    ],
  });
  await saveConversation(join(directory, 'garden.json'), {
    ...createConversation({id: 'c2', title: 'Garden plan'}),
    messages: [createMessage('user', 'When should I plant tomatoes?', {id: 'm3'})],
  });
  await writeFile(join(directory, 'broken.json'), '{not json', 'utf8');
  return cwd;
};

describe('saved conversation search', () => {
  it('finds case-insensitive matches and skips unreadable files', async () => {
    const cwd = await workspace();
    const results = await searchConversations(join(cwd, 'conversations'), 'BORROW');
    expect(results).toEqual([
      {
        path: join(cwd, 'conversations', 'rust.json'),
        title: 'Rust lifetimes',
        matches: 2,
        excerpt: 'Explain borrow checking in Rust.',
      },
    ]);
    expect(await searchConversations(join(cwd, 'missing'), 'borrow')).toEqual([]);
  });

  it('reports matches through /search', async () => {
    const cwd = await workspace();
    const store = new ChatStore();
    const session = new ChatSession(store, new EchoTransport({delayMs: 0}));
    const context = {store, session, cwd, setHelp: () => {}, setTheme: () => {}, onQuit: () => {}};

    await executeSlashCommand({name: 'search', arguments: ['tomatoes'], rest: 'tomatoes'}, context);
    expect(store.getSnapshot().notice).toContain('1 saved conversation mention "tomatoes"');
    expect(store.getSnapshot().notice).toContain(join(cwd, 'conversations', 'garden.json'));

    await executeSlashCommand({name: 'search', arguments: ['kale'], rest: 'kale'}, context);
    expect(store.getSnapshot().notice).toContain('No saved conversations');
  });
});
