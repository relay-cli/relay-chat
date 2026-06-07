import {describe, expect, it} from 'vitest';
import {estimateConversationTokens, estimateTokens, titleFromMessage} from '../src/model/index.js';

describe('conversation text helpers', () => {
  it('estimates token volume without reporting zero for nonempty text', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('hello')).toBe(2);
    expect(estimateConversationTokens([{content: 'hello'}])).toBe(6);
  });

  it('collapses whitespace and bounds generated titles', () => {
    expect(titleFromMessage('  hello\n  there ')).toBe('hello there');
    expect(titleFromMessage('x'.repeat(80))).toHaveLength(54);
  });
});
