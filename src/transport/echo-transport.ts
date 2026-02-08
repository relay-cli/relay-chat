import {estimateTokens} from '../model/index.js';
import type {ChatChunk, ChatRequest, ChatTransport} from './types.js';

export interface EchoTransportOptions {
  delayMs?: number;
  response?: (request: ChatRequest) => string;
}

const defaultResponse = (request: ChatRequest): string => {
  const prompt = request.messages.findLast((message) => message.role === 'user')?.content ?? '';
  return [
    'This reply is coming from the built-in demo transport.',
    '',
    `You wrote: **${prompt}**`,
    '',
    'Connect a model command when you want to replace this deterministic response.',
  ].join('\n');
};

const sleep = async (delayMs: number, signal: AbortSignal): Promise<void> => {
  if (delayMs <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delayMs);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason instanceof Error ? signal.reason : new Error('Cancelled'));
      },
      {once: true},
    );
  });
};

export class EchoTransport implements ChatTransport {
  readonly name = 'demo';
  readonly #delayMs: number;
  readonly #response: (request: ChatRequest) => string;

  constructor(options: EchoTransportOptions = {}) {
    this.#delayMs = options.delayMs ?? 24;
    this.#response = options.response ?? defaultResponse;
  }

  async *stream(request: ChatRequest, signal: AbortSignal): AsyncIterable<ChatChunk> {
    const response = this.#response(request);
    const pieces = response.match(/\S+\s*|\n/g) ?? [response];
    for (const text of pieces) {
      if (signal.aborted) throw signal.reason;
      await sleep(this.#delayMs, signal);
      yield {type: 'delta', text};
    }
    yield {
      type: 'usage',
      usage: {
        inputTokens: request.messages.reduce(
          (total, message) => total + estimateTokens(message.content),
          0,
        ),
        outputTokens: estimateTokens(response),
      },
    };
    yield {type: 'done'};
  }
}
