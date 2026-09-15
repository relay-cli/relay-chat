import {describe, expect, it} from 'vitest';
import {createConversation} from '../src/model/index.js';
import {ChatSession} from '../src/session/index.js';
import {ChatStore} from '../src/store/index.js';
import {EchoTransport} from '../src/transport/index.js';
import type {ChatTransport} from '../src/transport/index.js';

describe('ChatSession', () => {
  it('adds a user turn and completes a streamed assistant reply', async () => {
    const store = new ChatStore(createConversation({id: 'c1'}));
    const session = new ChatSession(
      store,
      new EchoTransport({delayMs: 0, response: () => 'answer'}),
    );
    await session.send('question');
    expect(store.getSnapshot().conversation.messages).toMatchObject([
      {role: 'user', content: 'question'},
      {role: 'assistant', content: 'answer', status: 'complete'},
    ]);
    expect(store.getSnapshot().conversation.title).toBe('question');
  });

  it('regenerates without duplicating the user turn', async () => {
    let count = 0;
    const store = new ChatStore(createConversation({id: 'c1'}));
    const session = new ChatSession(
      store,
      new EchoTransport({delayMs: 0, response: () => `answer ${++count}`}),
    );
    await session.send('question');
    await session.regenerate();
    expect(store.getSnapshot().conversation.messages.map(({content}) => content)).toEqual([
      'question',
      'answer 2',
    ]);
  });

  it('marks an interrupted assistant reply as cancelled', async () => {
    const transport: ChatTransport = {
      name: 'blocking',
      async *stream(_request, signal) {
        yield {type: 'delta', text: 'partial'};
        await new Promise<void>((_resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(signal.reason instanceof Error ? signal.reason : new Error('Cancelled')),
            {once: true},
          );
        });
      },
    };
    const store = new ChatStore(createConversation({id: 'c1'}));
    const session = new ChatSession(store, transport);
    const pending = session.send('question');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(session.cancel()).toBe(true);
    await pending;
    expect(store.getSnapshot().conversation.messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'partial',
      status: 'cancelled',
    });
  });

  it('edits a user turn and removes everything after it', async () => {
    const store = new ChatStore(createConversation({id: 'c1'}));
    const session = new ChatSession(
      store,
      new EchoTransport({
        delayMs: 0,
        response: (request) => request.messages.at(-1)?.content ?? '',
      }),
    );
    await session.send('first');
    const user = store.getSnapshot().conversation.messages[0];
    expect(user).toBeDefined();
    await session.editAndResend(user?.id ?? '', 'revised');
    expect(store.getSnapshot().conversation.messages.map(({content}) => content)).toEqual([
      'revised',
      'revised',
    ]);
  });
});
