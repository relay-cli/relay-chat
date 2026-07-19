import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {CommandTransport} from '../src/transport/index.js';

const fixture = fileURLToPath(new URL('./fixtures/model.mjs', import.meta.url));

describe('CommandTransport', () => {
  it('exchanges one request and streamed JSON Lines chunks', async () => {
    const transport = new CommandTransport({command: [process.execPath, fixture]});
    const chunks = [];
    for await (const chunk of transport.stream(
      {conversationId: 'c1', messages: [{role: 'user', content: 'hello'}]},
      new AbortController().signal,
    )) chunks.push(chunk);
    expect(chunks).toEqual([
      {type: 'delta', text: 'seen 1'},
      {type: 'usage', usage: {outputTokens: 2}},
      {type: 'done'},
    ]);
  });
});
