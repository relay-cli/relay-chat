import {createServer, type IncomingMessage, type Server} from 'node:http';
import type {AddressInfo} from 'node:net';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';
import {CommandTransport, type ChatChunk} from '../src/transport/index.js';

const adapter = fileURLToPath(new URL('../examples/react-agent-model.mjs', import.meta.url));
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

const serve = async (events: string[]): Promise<{url: string; received: unknown[]}> => {
  const received: unknown[] = [];
  const server = createServer((request, response) => {
    void readBody(request).then((body) => {
      received.push({path: request.url, body});
      response.writeHead(200, {'content-type': 'text/event-stream'});
      for (const event of events) response.write(event);
      response.end();
    });
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {url: `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`, received};
};

const event = (type: string, data: unknown): string =>
  `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;

const run = async (url: string): Promise<ChatChunk[]> => {
  const transport = new CommandTransport({
    command: [process.execPath, adapter],
    env: {...process.env, RELAY_AGENT_URL: url},
  });
  const chunks: ChatChunk[] = [];
  for await (const chunk of transport.stream(
    {
      conversationId: 'c1',
      messages: [
        {role: 'user', content: 'first'},
        {role: 'assistant', content: 'reply'},
        {role: 'user', content: 'What time is it?'},
      ],
    },
    new AbortController().signal,
  )) {
    chunks.push(chunk);
  }
  return chunks;
};

describe('ReAct agent example adapter', () => {
  it('sends the newest user message on the conversation thread and streams text', async () => {
    const server = await serve([
      event('text', {type: 'text', text: 'It is '}),
      event('text', {type: 'text', text: 'noon.'}),
      event('done', {type: 'done', threadId: 'c1'}),
    ]);

    expect(await run(server.url)).toEqual([
      {type: 'delta', text: 'It is '},
      {type: 'delta', text: 'noon.'},
      {type: 'done'},
    ]);
    expect(server.received).toEqual([
      {path: '/v1/chat/stream', body: {input: 'What time is it?', threadId: 'c1'}},
    ]);
  });

  it('fails the turn on a streamed error event', async () => {
    const server = await serve([
      event('text', {type: 'text', text: 'partial'}),
      event('error', {error: 'Step limit reached.'}),
    ]);

    await expect(run(server.url)).rejects.toThrow('Step limit reached.');
  });
});
