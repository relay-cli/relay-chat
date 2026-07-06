import {describe, expect, it} from 'vitest';
import {createMessage} from '../src/model/index.js';
import {messageWindow} from '../src/ui/message-window.js';

const messages = ['1', '2', '3', '4'].map((id) => createMessage('user', id, {id}));

describe('messageWindow', () => {
  it('shows the latest messages and scrolls back from the end', () => {
    expect(messageWindow(messages, 2, 0).map(({id}) => id)).toEqual(['3', '4']);
    expect(messageWindow(messages, 2, 1).map(({id}) => id)).toEqual(['2', '3']);
    expect(messageWindow(messages, 20, 0)).toHaveLength(4);
  });
});
