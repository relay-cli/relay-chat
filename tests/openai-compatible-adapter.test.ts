import {createServer, type IncomingMessage, type Server} from 'node:http';
import type {AddressInfo} from 'node:net';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';
import {CommandTransport, type ChatChunk, type ChatRequest} from '../src/transport/index.js';

const adapter = fileURLToPath(new URL('../examples/openai-compatible-model.mjs', import.meta.url));
const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))),
  );
});

const readBody = async (request: IncomingMessage): Promise<unknown> => {
  let body = '';
  for await (const chunk of request) body += String(chunk);
  return JSON.parse(body);
};

const serve = async (handler: Parameters<typeof createServer>[1]): Promise<string> => {
  const server = createServer(handler);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${String((server.address() as AddressInfo).port)}/v1`;
};

const run = async (baseUrl: string, request: ChatRequest): Promise<ChatChunk[]> => {
  const transport = new CommandTransport({
    command: [process.execPath, adapter],
    env: {...process.env, RELAY_OPENAI_BASE_URL: baseUrl},
  });
  const chunks: ChatChunk[] = [];
  for await (const chunk of transport.stream(request, new AbortController().signal)) {
    chunks.push(chunk);
  }
  return chunks;
};

describe('OpenAI-compatible example adapter', () => {
  it('streams chat-completion deltas, model, and usage', async () => {
    let received: unknown;
    const baseUrl = await serve((request, response) => {
      void readBody(request).then((body) => {
        received = body;
        const model = 'qwen2.5-0.5b-instruct-q4-k-m';
        const event = (value: unknown): string => `data: ${JSON.stringify(value)}\n\n`;
        response.writeHead(200, {'content-type': 'text/event-stream'});
        response.write(': keepalive\n\n');
        response.write(event({model, choices: [{index: 0, delta: {content: 'Hel'}}]}));
        response.write(event({model, choices: [{index: 0, delta: {content: 'lo'}}]}));
        response.write(event({model, choices: [{index: 0, delta: {}, finish_reason: 'stop'}]}));
        response.write(
          event({model, choices: [], usage: {prompt_tokens: 9, completion_tokens: 2}}),
        );
        response.end('data: [DONE]\n\n');
      });
    });

    const chunks = await run(baseUrl, {
      conversationId: 'c1',
      systemPrompt: 'Be brief.',
      messages: [{role: 'user', content: 'Say hello.'}],
    });

    expect(received).toEqual({
      model: 'qwen2.5-0.5b-instruct-q4-k-m',
      messages: [
        {role: 'system', content: 'Be brief.'},
        {role: 'user', content: 'Say hello.'},
      ],
      stream: true,
    });
    expect(chunks).toEqual([
      {type: 'model', model: 'qwen2.5-0.5b-instruct-q4-k-m'},
      {type: 'delta', text: 'Hel'},
      {type: 'delta', text: 'lo'},
      {type: 'usage', usage: {inputTokens: 9, outputTokens: 2}},
      {type: 'done'},
    ]);
  });

  it('reports the server error message', async () => {
    const baseUrl = await serve((_request, response) => {
      response.writeHead(503, {'content-type': 'application/json'});
      response.end(JSON.stringify({error: {code: 'not_ready', message: 'Model is not ready.'}}));
    });

    await expect(
      run(baseUrl, {conversationId: 'c1', messages: [{role: 'user', content: 'hi'}]}),
    ).rejects.toThrow('503: Model is not ready.');
  });
});
