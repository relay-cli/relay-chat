import {describe, expect, it} from 'vitest';
import {commandNames, parseSlashCommand} from '../src/commands/index.js';

describe('slash commands', () => {
  it('parses quoted arguments without changing the rest text', () => {
    expect(parseSlashCommand('/save "my chats/test.json"')).toEqual({
      name: 'save',
      arguments: ['my chats/test.json'],
      rest: '"my chats/test.json"',
    });
    expect(parseSlashCommand('hello')).toBeUndefined();
  });

  it('keeps every documented command discoverable', () => {
    expect(commandNames).toContain('save');
    expect(commandNames).toContain('regenerate');
    expect(commandNames).not.toContain('tool');
  });
});
