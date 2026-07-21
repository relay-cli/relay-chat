import {describe, expect, it} from 'vitest';
import {createConversation} from '../src/model/index.js';
import {ChatSession} from '../src/session/index.js';
import {ChatStore} from '../src/store/index.js';
import {EchoTransport} from '../src/transport/index.js';

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
});
