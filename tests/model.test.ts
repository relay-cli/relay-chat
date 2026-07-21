import {describe, expect, it} from 'vitest';
import {createConversation, createMessage} from '../src/model/index.js';

describe('model factories', () => {
  it('creates deterministic records when factories and clocks are supplied', () => {
    const now = new Date('2026-01-02T03:04:05.000Z');
    expect(createMessage('user', 'hello', {idFactory: () => 'm1', now})).toMatchObject({
      id: 'm1',
      role: 'user',
      content: 'hello',
      createdAt: now.toISOString(),
      status: 'complete',
    });
    expect(createConversation({idFactory: () => 'c1', now})).toMatchObject({
      id: 'c1',
      title: 'New conversation',
      createdAt: now.toISOString(),
      messages: [],
    });
  });
});
