import {describe, expect, it} from 'vitest';
import {encodeRequest, parseProtocolChunk} from '../src/transport/index.js';

describe('JSON Lines protocol', () => {
  it('encodes requests and accepts every supported chunk', () => {
    expect(encodeRequest({conversationId: 'c1', messages: []})).toBe(
      '{"conversationId":"c1","messages":[]}\n',
    );
    expect(parseProtocolChunk('{"type":"delta","text":"hi"}')).toEqual({type: 'delta', text: 'hi'});
    expect(parseProtocolChunk('{"type":"usage","usage":{"outputTokens":2}}')).toEqual({
      type: 'usage',
      usage: {outputTokens: 2},
    });
    expect(parseProtocolChunk('{"type":"done"}')).toEqual({type: 'done'});
  });

  it('rejects malformed and unknown chunks', () => {
    expect(() => parseProtocolChunk('not json')).toThrow(/invalid JSON/);
    expect(() => parseProtocolChunk('{"type":"tool"}')).toThrow(/unsupported chunk/);
  });
});
