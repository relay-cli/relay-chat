import React from 'react';
import {render} from 'ink-testing-library';
import {describe, expect, it} from 'vitest';
import {createMessage} from '../src/model/index.js';
import {MessageBubble} from '../src/ui/MessageBubble.js';
import {relayTheme} from '../src/ui/theme.js';

describe('terminal message rendering', () => {
  it('renders role metadata and markdown content', () => {
    const message = {...createMessage('assistant', '**hello**\n\n```ts\nconst x = 1;\n```', {id: 'a1'}), model: 'local-model', latencyMs: 1200};
    const view = render(<MessageBubble message={message} theme={relayTheme} />);
    expect(view.lastFrame()).toContain('ASSISTANT');
    expect(view.lastFrame()).toContain('local-model · 1.2s');
    expect(view.lastFrame()).toContain('const x = 1;');
  });
});
