import {describe, expect, it} from 'vitest';
import {DraftHistory} from '../src/composer/history.js';

describe('DraftHistory', () => {
  it('navigates submitted prompts and restores the pending draft', () => {
    const history = new DraftHistory();
    history.push('first');
    history.push('second');
    expect(history.previous('pending')).toBe('second');
    expect(history.previous('second')).toBe('first');
    expect(history.next('first')).toBe('second');
    expect(history.next('second')).toBe('pending');
  });
});
