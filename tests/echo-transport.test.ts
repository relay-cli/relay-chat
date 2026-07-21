import {describe, expect, it} from 'vitest';
import {EchoTransport} from '../src/transport/index.js';

describe('EchoTransport', () => {
  it('streams text followed by usage and completion', async () => {
    const transport = new EchoTransport({delayMs: 0, response: () => 'hello world'});
    const chunks = [];
    for await (const chunk of transport.stream(
      {conversationId: 'c1', messages: [{role: 'user', content: 'hello'}]},
      new AbortController().signal,
    ))
      chunks.push(chunk);
    expect(chunks.filter(({type}) => type === 'delta').length).toBeGreaterThan(0);
    expect(chunks.at(-1)).toEqual({type: 'done'});
  });
});
