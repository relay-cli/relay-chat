import type {ChatChunk, ChatRequest} from './types.js';

type ProtocolChunk = ChatChunk | {type: 'error'; message: string};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const encodeRequest = (request: ChatRequest): string => `${JSON.stringify(request)}\n`;

export const parseProtocolChunk = (line: string): ProtocolChunk => {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new Error(`Model command wrote invalid JSON: ${line}`);
  }
  if (!isRecord(value) || typeof value.type !== 'string') {
    throw new Error('Model command wrote a JSON value without a chunk type.');
  }
  if (value.type === 'delta' && typeof value.text === 'string') {
    return {type: 'delta', text: value.text};
  }
  if (value.type === 'model' && typeof value.model === 'string') {
    return {type: 'model', model: value.model};
  }
  if (value.type === 'usage' && isRecord(value.usage)) {
    const {inputTokens, outputTokens} = value.usage;
    if (
      (inputTokens === undefined || typeof inputTokens === 'number') &&
      (outputTokens === undefined || typeof outputTokens === 'number')
    ) {
      return {
        type: 'usage',
        usage: {
          ...(inputTokens === undefined ? {} : {inputTokens}),
          ...(outputTokens === undefined ? {} : {outputTokens}),
        },
      };
    }
  }
  if (value.type === 'error' && typeof value.message === 'string') {
    return {type: 'error', message: value.message};
  }
  if (value.type === 'done') return {type: 'done'};
  throw new Error(`Model command wrote an unsupported chunk: ${line}`);
};
