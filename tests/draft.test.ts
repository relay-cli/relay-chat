import {describe, expect, it} from 'vitest';
import {deleteBackward, deleteForward, deleteWordBackward, insertText, moveCursor} from '../src/composer/draft.js';

describe('draft editing', () => {
  it('inserts and deletes around the cursor', () => {
    expect(insertText({value: 'ac', cursor: 1}, 'b')).toEqual({value: 'abc', cursor: 2});
    expect(deleteBackward({value: 'abc', cursor: 2})).toEqual({value: 'ac', cursor: 1});
    expect(deleteForward({value: 'abc', cursor: 1})).toEqual({value: 'ac', cursor: 1});
  });

  it('deletes words and clamps cursor movement', () => {
    expect(deleteWordBackward({value: 'hello wide world', cursor: 10})).toEqual({value: 'hello world', cursor: 6});
    expect(moveCursor({value: 'abc', cursor: 1}, 99).cursor).toBe(3);
  });
});
