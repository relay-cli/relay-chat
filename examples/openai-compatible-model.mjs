// Relay Chat command adapter for OpenAI-compatible chat-completions servers,
// such as Impossible Inference (the default) or Ollama.
import readline from 'node:readline';

const baseUrl = (process.env.RELAY_OPENAI_BASE_URL ?? 'http://127.0.0.1:8080/v1').replace(
  /\/+$/,
  '',
);
const defaultModel = process.env.RELAY_OPENAI_MODEL ?? 'qwen2.5-0.5b-instruct-q4-k-m';
const apiKey = process.env.RELAY_OPENAI_API_KEY;

const write = (chunk) => process.stdout.write(`${JSON.stringify(chunk)}\n`);

const errorMessage = async (response) => {
  const body = await response.text();
  try {
    const parsed = JSON.parse(body);
    const message = parsed?.error?.message ?? parsed?.error;
    if (typeof message === 'string') return `${response.status}: ${message}`;
  } catch {
    // Fall through to the raw body.
  }
  return `${response.status}: ${body.slice(0, 500) || response.statusText}`;
};

async function* serverEvents(body) {
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const bytes of body) {
    buffer += decoder.decode(bytes, {stream: true});
    let boundary;
    while ((boundary = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, '');
      const data = block
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).replace(/^ /, ''))
        .join('\n');
      if (data !== '') yield data;
    }
  }
}

const answer = async (request) => {
  const model = request.model ?? defaultModel;
  const messages = [
    ...(request.systemPrompt ? [{role: 'system', content: request.systemPrompt}] : []),
    ...request.messages,
  ];
  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'text/event-stream',
        ...(apiKey ? {authorization: `Bearer ${apiKey}`} : {}),
      },
      body: JSON.stringify({model, messages, stream: true}),
    });
  } catch (error) {
    return write({type: 'error', message: `Could not reach ${baseUrl}: ${error.message}`});
  }
  if (!response.ok || response.body === null) {
    return write({type: 'error', message: await errorMessage(response)});
  }

  let reportedModel = false;
  for await (const data of serverEvents(response.body)) {
    if (data === '[DONE]') break;
    const chunk = JSON.parse(data);
    if (chunk.error !== undefined) {
      return write({type: 'error', message: chunk.error.message ?? JSON.stringify(chunk.error)});
    }
    if (!reportedModel && typeof chunk.model === 'string') {
      write({type: 'model', model: chunk.model});
      reportedModel = true;
    }
    const text = chunk.choices?.[0]?.delta?.content;
    if (typeof text === 'string' && text !== '') write({type: 'delta', text});
    if (chunk.usage) {
      const {prompt_tokens: inputTokens, completion_tokens: outputTokens} = chunk.usage;
      write({
        type: 'usage',
        usage: {
          ...(typeof inputTokens === 'number' ? {inputTokens} : {}),
          ...(typeof outputTokens === 'number' ? {outputTokens} : {}),
        },
      });
    }
  }
  write({type: 'done'});
};

const input = readline.createInterface({input: process.stdin, crlfDelay: Infinity});
for await (const line of input) await answer(JSON.parse(line));
