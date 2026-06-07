import {describe, expect, it, vi} from 'vitest';
import {createConversation, createMessage} from '../src/model/index.js';
import {ChatStore} from '../src/store/index.js';

describe('ChatStore', () => {
  it('publishes streaming updates and final metadata', () => {
    const store = new ChatStore(createConversation({id: 'c1'}));
    const listener = vi.fn();
    store.subscribe(listener);
    store.addMessage(createMessage('assistant', '', {id: 'a1', status: 'streaming'}));
    store.setActiveAssistant('a1');
    store.appendDelta('a1', 'hello');
    store.completeMessage('a1', {usage: {outputTokens: 2}, latencyMs: 20});
    expect(store.getSnapshot().conversation.messages[0]).toMatchObject({
      content: 'hello', status: 'complete', usage: {outputTokens: 2}, latencyMs: 20,
    });
    expect(store.getSnapshot().activeAssistantId).toBeUndefined();
    expect(listener).toHaveBeenCalled();
  });

  it('truncates a conversation from an edited turn', () => {
    const store = new ChatStore(createConversation({id: 'c1'}));
    store.addMessage(createMessage('user', 'one', {id: 'u1'}));
    store.addMessage(createMessage('assistant', 'two', {id: 'a1'}));
    store.truncateFrom('u1');
    expect(store.getSnapshot().conversation.messages).toEqual([]);
  });
});
