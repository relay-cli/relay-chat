import {describe, expect, it} from 'vitest';
import {parseCliOptions} from '../src/cli/options.js';

describe('CLI options', () => {
  it('separates Relay options from a model command', () => {
    expect(parseCliOptions(['--plain', '--prompt', 'hello', '--', 'node', 'model.mjs'])).toMatchObject({
      plain: true, prompt: 'hello', command: ['node', 'model.mjs'],
    });
  });

  it('rejects unknown or incomplete options', () => {
    expect(() => parseCliOptions(['--wat'])).toThrow('Unknown option');
    expect(() => parseCliOptions(['--prompt'])).toThrow('requires a value');
  });
});
