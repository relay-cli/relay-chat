// Relay Chat command adapter for the Impossible ReAct Agent streaming HTTP API.
import readline from 'node:readline';

const baseUrl = (process.env.RELAY_AGENT_URL ?? 'http://127.0.0.1:4141').replace(/\/+$/, '');

const write = (chunk) => process.stdout.write(`${JSON.stringify(chunk)}\n`);

async function* serverEvents(body) {
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const bytes of body) {
    buffer += decoder.decode(bytes, {stream: true});
    let boundary;
    while ((boundary = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, '');
      let event = 'message';
      const data = [];
      for (const line of block.split(/\r?\n/)) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
      }
      if (data.length > 0) yield {event, data: JSON.parse(data.join('\n'))};
    }
  }
}

const answer = async (request) => {
  // The agent keeps its own thread memory, so only the newest user message is sent.
  const input = request.messages.findLast((message) => message.role === 'user')?.content ?? '';
  let response;
  try {
    response = await fetch(`${baseUrl}/v1/chat/stream`, {
      method: 'POST',
      headers: {'content-type': 'application/json', accept: 'text/event-stream'},
      body: JSON.stringify({input, threadId: request.conversationId}),
    });
  } catch (error) {
    return write({type: 'error', message: `Could not reach ${baseUrl}: ${error.message}`});
  }
  if (!response.ok || response.body === null) {
    const body = await response.text();
    let message = body.slice(0, 500) || response.statusText;
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed.error === 'string') message = parsed.error;
    } catch {
      // Keep the raw body.
    }
    return write({type: 'error', message: `${response.status}: ${message}`});
  }

  for await (const {event, data} of serverEvents(response.body)) {
    if (event === 'text' && typeof data.text === 'string') write({type: 'delta', text: data.text});
    if (event === 'error') return write({type: 'error', message: String(data.error)});
    if (event === 'done') break;
  }
  write({type: 'done'});
};

const lines = readline.createInterface({input: process.stdin, crlfDelay: Infinity});
for await (const line of lines) await answer(JSON.parse(line));
