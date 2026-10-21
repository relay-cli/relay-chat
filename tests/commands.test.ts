import {describe, expect, it} from 'vitest';
import {commandNames, executeSlashCommand, parseSlashCommand} from '../src/commands/index.js';
import {createConversation} from '../src/model/index.js';
import {ChatSession} from '../src/session/index.js';
import {ChatStore} from '../src/store/index.js';
import type {ChatTransport} from '../src/transport/index.js';

describe('slash commands', () => {
  it('parses quoted arguments without changing the rest text', () => {
    expect(parseSlashCommand('/save "my chats/test.json"')).toEqual({
      name: 'save',
      arguments: ['my chats/test.json'],
      rest: '"my chats/test.json"',
    });
    expect(parseSlashCommand('hello')).toBeUndefined();
  });

  it('keeps every documented command discoverable', () => {
    expect(commandNames).toContain('save');
    expect(commandNames).toContain('regenerate');
    expect(commandNames).not.toContain('tool');
  });

  it('keeps the streaming reply when /clear or /load is used mid-reply', async () => {
    const transport: ChatTransport = {
      name: 'blocking',
      async *stream(_request, signal) {
        yield {type: 'delta', text: 'partial'};
        await new Promise<void>((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Cancelled')), {once: true});
        });
      },
    };
    const store = new ChatStore(createConversation({id: 'c1'}));
    const session = new ChatSession(store, transport);
    const context = {store, session, setHelp: () => {}, setTheme: () => {}, onQuit: () => {}};
    const pending = session.send('question');
    await new Promise((resolve) => setTimeout(resolve, 0));

    const clear = {name: 'clear', arguments: [], rest: ''};
    const load = {name: 'load', arguments: ['chat.json'], rest: 'chat.json'};
    await expect(executeSlashCommand(clear, context)).rejects.toThrow('Cancel the active reply');
    await expect(executeSlashCommand(load, context)).rejects.toThrow('Cancel the active reply');
    expect(store.getSnapshot().activeAssistantId).toBeDefined();
    expect(store.getSnapshot().conversation.messages).toHaveLength(2);

    session.cancel();
    await pending;
  });
});
