import {describe, expect, it} from 'vitest';
import {assertConversation, createConversation, isConversation} from '../src/model/index.js';

describe('conversation validation', () => {
  it('accepts supported records and rejects incomplete input', () => {
    const conversation = createConversation({id: 'c1'});
    expect(isConversation(conversation)).toBe(true);
    expect(assertConversation(conversation)).toBe(conversation);
    expect(isConversation({schemaVersion: 1, messages: []})).toBe(false);
    expect(() => assertConversation({})).toThrow(/supported Relay Chat conversation/);
  });
});
