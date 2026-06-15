import {describe, expect, it} from 'vitest';
import {parseMarkdownBlocks} from '../src/ui/markdown/parse-blocks.js';
import {parseInline} from '../src/ui/markdown/parse-inline.js';

describe('markdown parsing', () => {
  it('recognizes headings lists quotes and fenced code', () => {
    const blocks = parseMarkdownBlocks('# Title\n\n- one\n- two\n\n> note\n\n```ts\nconst x = 1;\n```');
    expect(blocks.map(({type}) => type)).toEqual(['heading', 'list', 'quote', 'code']);
    expect(blocks.at(-1)).toMatchObject({type: 'code', language: 'ts'});
  });

  it('recognizes inline emphasis code and links', () => {
    expect(parseInline('Use **bold**, `code`, and [docs](https://example.com).').map(({type}) => type)).toEqual([
      'text', 'strong', 'text', 'code', 'text', 'link', 'text',
    ]);
  });
});
