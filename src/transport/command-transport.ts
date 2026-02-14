import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {encodeRequest, parseProtocolChunk} from './protocol.js';
import {prepareCommand} from './resolve-command.js';
import {terminateCommand} from './terminate-command.js';
import type {ChatChunk, ChatRequest, ChatTransport} from './types.js';

export interface CommandTransportOptions {
  command: readonly string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export class CommandTransport implements ChatTransport {
  readonly name = 'command';
  readonly #options: CommandTransportOptions;

  constructor(options: CommandTransportOptions) {
    if (options.command.length === 0) throw new Error('A model command is required.');
    this.#options = options;
  }

  async *stream(request: ChatRequest, signal: AbortSignal): AsyncIterable<ChatChunk> {
    const prepared = prepareCommand(this.#options.command);
    const child = spawn(prepared.executable, prepared.arguments, {
      cwd: this.#options.cwd,
      env: this.#options.env,
      windowsVerbatimArguments: prepared.windowsVerbatimArguments ?? false,
      windowsHide: true,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      stderr = `${stderr}${chunk}`.slice(-8000);
    });
    const abort = (): void => {
      terminateCommand(child);
    };
    signal.addEventListener('abort', abort, {once: true});

    try {
      child.stdin.end(encodeRequest(request));
      const lines = createInterface({input: child.stdout, crlfDelay: Infinity});
      for await (const line of lines) {
        if (line.trim() === '') continue;
        const chunk = parseProtocolChunk(line);
        if (chunk.type === 'error') throw new Error(chunk.message);
        yield chunk;
      }
      const exit = await new Promise<{code: number | null; signal: NodeJS.Signals | null}>(
        (resolve, reject) => {
          child.once('error', reject);
          child.once('close', (code, closeSignal) => resolve({code, signal: closeSignal}));
        },
      );
      if (signal.aborted) throw signal.reason;
      if (exit.code !== 0) {
        const detail = stderr.trim();
        throw new Error(
          detail === ''
            ? `Model command exited with ${exit.signal ?? `code ${exit.code ?? 'unknown'}`}.`
            : detail,
        );
      }
    } finally {
      signal.removeEventListener('abort', abort);
    }
  }
}
